# Babel phase timing for the taint microbenchmark

Recorded findings: [RESULTS.md](RESULTS.md).

This experiment measures all 444 reviewed taint microbenchmarks with the
existing runner. It keeps Babel enabled and records the time spent in Babel
separately from the enclosing process wall time. The experiment uses isolated
Jalangi copies; installed sources and paper tables are unchanged.

## Measurement boundaries

Each instrumented child emits one `@@DJX_BABEL_PHASES` JSON marker on exit.
The marker uses native helpers captured before the analysis starts.

| Field | Measured interval |
|---|---|
| `load_ms` | Loading `@babel/core` |
| `warmup_ms` | The existing `transformSync('', babelOptions)` call, including lazy preset/plugin loading |
| `helpers_ms` | Loading `@babel/helpers` and `regenerator-runtime` |
| `init_ms` | Entire original Babel initialization block, including all three intervals above |
| `transform_ms` | Sum of actual source `transformSync(code, babelOptions)` calls; includes failed attempts and their catch handling |
| `transform_calls` | Number of actual source-transform attempts, excluding the initial empty-source call |
| `transform_failures` | Number of actual source-transform attempts that throw |
| `elapsed_ms` | Original runner's child-process wall time |
| `babel_total_ms` | `init_ms + transform_ms` |
| `total_minus_transform_ms` | Wall time minus actual source-transform time |
| `total_minus_babel_ms` | Wall time minus Babel initialization and actual source-transform time |

`init_ms` includes the small gaps between its subintervals. Do not add its
components to `init_ms` again. Dynamic code transformed by the same instrumenter
is included in `transform_ms`. The existing `exec_ms` body timer is preserved,
but can overlap dynamic transformations and is not an additive stage.

Both subtracted totals are **accounting residuals**, not independently measured
executions with Babel disabled. They still include process startup, Jalangi
instrumentation, analysis setup, execution, and exit costs. Babel still changes
the source being instrumented. In particular, the residual is not a measure of
Jalangi instrumentation alone or steady-state analysis performance.

The timer registration and marker serialization are outside the Babel intervals
and remain in wall time. A separate unprofiled run checks verdict preservation;
it is not a statistically powered timer-overhead study.

## Run

The setup needs the configured DynaJS and NodeMedic checkouts, including
NodeMedic's `__assert_taint__` verdict support and built DynaJS analyses.
Use a new experiment directory each time:

```sh
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export NODEMEDIC_HOME="$HOME/NodeMedic-wip"
python3 setup.py "$HOME/dynajs" "$NODEMEDIC_HOME" "$HOME/experiments/babel-timing-new"
bash run.sh "$HOME/experiments/babel-timing-new"
python3 summarize.py "$HOME/experiments/babel-timing-new"
```

Default sequence, without concurrent benchmark conditions:

1. Unmodified Jalangi copy: all 444 cases, one correctness-control run each.
2. Profiled copy: all 444 cases, one discarded run and three measured runs each.
3. Plain Node and DynaJS: the same discarded/measured counts for each case.

Override `REPS` and `WARMUP` if needed. Every run starts a fresh process; the
discarded runs do not turn this into a persistent-process JIT warmup experiment.

`summarize.py` checks completeness, merges phase markers into `measurements.csv`,
checks verdicts against the control and across repetitions, and groups results
as Overall, ES5, ES6+, Built-ins, and Syntax. Failed runs remain in the main means,
matching the existing benchmark's wall-time aggregation. The JSON also includes
successful-only means and phase-marker coverage; missing timings are never zero.
Cases are counted once in accuracy statistics, not once per repeat. The current
corpus has one assertion per file; the summarizer checks that assumption before
aggregating per-process times.

## Recorded experiment

- `a4:/home/choems/experiments/babel-timing-20260926`
- Ryzen 9 7950X; Node v24.14.1.
- DynaJS `6d0b688e0dc5d3b56a2c3cf00f5126972711b4aa`.
- NodeMedic `0e27530f917daa623fbd699e38855b2e08937967`.
- Policies: `string:precise,array:precise,object:precise`.
- The single-case `smoke` directory is excluded from final statistics.
- This experiment covers Table 3's taint suite. ExpoSE/concolic and end-to-end
  npm experiments are outside its scope.
