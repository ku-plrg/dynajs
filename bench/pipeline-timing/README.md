# Separate instrumentation and execution times

Recorded findings: [RESULTS.md](RESULTS.md).

This experiment adds native timers around both tools' instrumentation functions
and the benchmark's runtime. It uses isolated source/build copies and the same
444-case reviewed taint suite. Installed framework and paper sources are unchanged.

## Output columns

| Column | Boundary |
|---|---|
| `wall_ms` | Parent runner's child-process start to termination |
| `babel_init_ms` | Original Babel module/preset/helper initialization block |
| `babel_transform_ms` | Actual source transformations; zero for Node and DynaJS |
| `instrument_inclusive_ms` | Outermost calls to Jalangi `instrumentCode` or DynaJS `instrument` |
| `instrument_ms` | Instrumentation function time minus its Babel transforms |
| `sync_body_ms` | Start of benchmark body to its last top-level line |
| `execution_to_idle_ms` | Start of benchmark body to the final observed `beforeExit` event, on normal completion |
| `dynamic_instrument_inclusive_ms` | Instrumentation intervals overlapping the execution-to-idle window |
| `other_ms` | Wall time minus Babel initialization, inclusive instrumentation, and execution-to-idle, adding back dynamic overlap |

Instrumentation includes parsing, AST traversal, rewriting/code generation, and
the instrumentation function's source-map/location bookkeeping. Source file reads,
generated-file writes, module loading, V8 compilation of the returned JavaScript,
and process startup/teardown are outside this core-instrumentation measurement.
Attempted instrumentation that throws is still timed, with a failure flag.
Jalangi's instrumentation function invokes Babel internally, so its Babel time
is subtracted to avoid counting it twice. Babel initialization occurs before
these instrumentation calls.

The execution-to-idle interval includes analysis callbacks, asynchronous tasks,
microtasks, and event-loop drain/scheduling latency. It excludes `exit` callbacks.
It is a cold execution interval, not a steady-state CPU-only measurement. The
timing helper does not schedule additional work or force termination. The current
corpus has no application `beforeExit` handlers. If reusing this harness for
programs with such handlers, their final synchronous callback work can occur
after our timestamp and needs a different completion protocol.

The previous benchmark's `exec_ms` stops at the last top-level line, so it can
exclude continuations of async functions. We retain that interval separately as
`sync_body_ms` and use execution-to-idle as the completion-aware runtime column.
Neither should be confused with wall time minus instrumentation.
`sync_body_ms` is contained in `execution_to_idle_ms`; these columns must not
be added together.

The benchmark's original `performance.now()` timestamp assignments and timing
wrapper are preserved exactly. A preload observes the existing timestamps on
exit, unboxing the analyses' wrapped numbers after recording the idle timestamp.
It adds no timing-helper call to the analyzed benchmark. Monotonic timestamps
from the two clock APIs are aligned at idle for overlap classification; this
alignment can have a few microseconds of capture skew.

No missing completion measurement is replaced by zero. Error runs remain in
`measurements.csv` with status and any available timing. The main printed table
uses only the same cases successfully completed by all three runners in every
repeat. JSON also reports per-tool complete and all-case statistics by edition
and feature kind. Do not add averages with different case populations.

Outermost instrumentation calls are timed to avoid nested double counting.
DynaJS's ESM loader runs on a worker thread, so each instrumentation call writes
a synchronous marker directly to stderr instead of relying on worker exit
handlers. Nanosecond monotonic timestamps identify instrumentation that overlaps
execution. Such overlap is not an additional disjoint stage.

## Reproduce

From the DynaJS repository, using a host with configured NodeMedic and built
DynaJS analyses:

```sh
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export NODEMEDIC_HOME="$HOME/NodeMedic-wip"
experiment="$HOME/experiments/pipeline-timing-new"
python3 bench/babel-timing/setup.py "$PWD" "$NODEMEDIC_HOME" "$experiment"
python3 bench/pipeline-timing/setup.py "$PWD" "$experiment"
bash bench/pipeline-timing/run.sh "$experiment"
python3 bench/pipeline-timing/summarize.py "$experiment"
```

`run.sh` prints the stage table after the benchmark finishes; the final command
can regenerate it without rerunning benchmarks. Summarization creates `measurements.csv`,
`summary.json`, and `SUMMARY.md`. `REPS` defaults to 3 and `WARMUP` to 1, with a
fresh child process on every iteration. Runners execute sequentially. An optional
`verdict-reference.csv` containing existing per-case runner results enables
automatic comparison against an earlier run; `reference_checked` records whether
this check was performed.

## Recorded run

- Server: `a4:/home/choems/experiments/pipeline-timing-20260926`.
- DynaJS source: `6d0b688e0dc5d3b56a2c3cf00f5126972711b4aa`.
- NodeMedic source: `0e27530f917daa623fbd699e38855b2e08937967`.
- Verdict references: the prior Babel timing experiment's unprofiled NodeMedic
  control and Node/DynaJS runs, with the same source commits and benchmark corpus.
- Smoke checks covered synchronous arithmetic and async/await. A delayed-timer
  check verified async inclusion; aborted and not-started runs were checked to
  produce missing completion time rather than zero.
- An initial diagnostic implementation called native helper functions from the
  analyzed source. Those calls added roughly 10ms to some DynaJS built-in cases.
  A four-way original/profile-build and original/new-wrapper comparison isolated
  the timing wrapper as the cause. That entire run is retained only under
  `diagnostic-intrusive-*` and excluded from results. `measured/` is the rerun
  using the unchanged original benchmark timing wrapper.
