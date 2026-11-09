# Table 3: ES5 without Babel

This experiment selects the 156 `@done`, `@target es5` taint cases from the
existing microbenchmark runner. It compares NodeMedic with Babel enabled and
disabled, then runs plain Node and DynaJS as timing references. All cases use
ES5 syntax (checked using Acorn with `ecmaVersion: 5`).

`setup.py` creates two isolated copies of the installed Jalangi source. The
disabled copy removes Babel loading, its empty-program initialization, helper
and regenerator preloading, and the actual Babel transform. It passes the
original program directly to the existing Acorn/Jalangi instrumentation.
The parser, instrumentation, analysis, policies, benchmarks, and scoring stay
the same. Installed source files are never modified. Dependencies are linked
to the configured NodeMedic installation.

The generated runner differs from the original only in its repository root,
an override for the Jalangi entry point, and the ES5 filter. Both Jalangi
conditions use independent copies to keep their setup comparable.

## Reproduce on a4

Prerequisites: the configured `/home/choems/dynajs` and
`/home/choems/NodeMedic-wip` checkouts, including built DynaJS analyses and
NodeMedic's verdict ghost functions. The initial Babel-enabled validation
reproduced Table 3's ES5 confusion matrix exactly: TP=65, FP=25, FN=4, TN=62.

```sh
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export NODEMEDIC_HOME="$HOME/NodeMedic-wip"
python3 setup.py "$HOME/dynajs" "$NODEMEDIC_HOME" "$HOME/experiments/es5-new-run"
bash run.sh "$HOME/experiments/es5-new-run"
python3 summarize.py "$HOME/experiments/es5-new-run"
```

Use a fresh output directory. Default: one discarded process run and five
measured process runs per case and condition. Override with `WARMUP` and
`REPS`. Conditions run sequentially. This is repeated cold process execution,
not a persistent-process JIT warmup benchmark.

Time is the existing runner's mean wall time, including process startup,
framework initialization, instrumentation, and execution. Overhead divides
that mean by the plain-Node mean from the same experiment. `exec_ms` is a
separate in-process body measurement; it is not the Table 3 runtime column.
Verdicts are counted once per case, with consistency checked across repeats.
Plain Node is a timing reference and has no accuracy score.

## Recorded run

- Server directory: `/home/choems/experiments/es5-no-babel-20260924` on `a4`.
- AMD Ryzen 9 7950X; Node v24.14.1.
- DynaJS commit: `6d0b688e0dc5d3b56a2c3cf00f5126972711b4aa`.
- NodeMedic checkout commit: `0e27530f917daa623fbd699e38855b2e08937967`.
- Policies: `string:precise,array:precise,object:precise`.
- ES5 composition: 108 built-in cases and 48 syntax cases; 69 positive and
  87 negative cases.
- `smoke-on` was an unsuccessful setup check before restoring the copied
  source's parent dependency lookup. Exclude it from all results.
- `validate-on` and `validate-off` are single-run correctness checks.
- Final results are exclusively `measured-babel-on`, `measured-babel-off`,
  and `measured-reference`.

Original paper sources and installed framework sources are unchanged.
