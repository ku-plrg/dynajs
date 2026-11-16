# test262 on the DynaJS spec models

Runs test262 only for the built-ins that DynaJS models (`Model.BUILTINS` in
`analyses/flow/internal/model.ts`), and sorts out why each failure happens.

```sh
npm run build
node bench/test262/supported.cjs all            # select + extract + run + report
node bench/test262/supported.cjs all --only '^String\.prototype\.pad'   # subset
```

The test262 checkout defaults to `$TEST262_DIR`, else `~/code/esmeta/tests/test262`.
Outputs go to `bench/test262/supported/`: `selection.json`, `report.md`,
`report.json`, `tests.jsonl` (one row per test), `results/{node,bare,model}.json`,
`results/hits.jsonl`. `--out` must stay under the dynajs root, because djx
only instruments files under its cwd.

## Steps

1. **select**: `MODEL_CHECK_LIST=1 djx run -p model-check` prints the supported
   builtins (the function objects the model map holds, named by walking `String`,
   `Array` and their prototypes), plus aliases such as `trimLeft` → `trimStart`.
   Each one maps to `test/built-ins/<path>` and `test/annexB/built-ins/<path>`. A
   constructor (`String`) maps to the top-level files of its directory only.
2. **extract**: `extract.cjs` inlines the harness includes and writes `manifest.jsonl`.
3. **run**: `run.cjs` runs the files three times. It now judges negative tests
   by the expected error name and async tests by `Test262:AsyncTestComplete`.
   - `node`: plain node (engine baseline).
   - `bare`: `djx -p noop-nobuiltin` (instrumentation only, models off).
   - `model`: `djx -p model-check`. Every supported call runs its model, even
     with bottom-primitive inputs, and even when called through
     `Function.prototype.call/apply` or `Reflect.apply`. Each process appends
     the models that ran to `results/hits.jsonl`.
4. **report**: classifies each test for its builtin:

| class | meaning |
|---|---|
| engine-fail | plain node fails; excluded |
| instr-fail | node passes, bare fails: an instrumentation issue, not a model issue |
| not-exercised | the builtin's model never ran (`length.js`, `name.js`, `prop-desc.js`, ...) |
| fail-not-exercised | the model run fails, but this builtin's model never ran |
| pass / model-fail | the model ran: the conformance numerator / the model-bug candidates |

conformance = pass / (pass + model-fail)

## Notes

- Harness code (`compareArray.js`, `propertyHelper.js`) also calls modeled
  builtins. A hit counts only if it names the test's own builtin.
- `$262.createRealm` throws in extracted (single-realm) mode, so cross-realm
  tests fail under every runner. They end up as engine-fail.
- Builtins excluded from modeling (`match`/`matchAll`/`search`, iterators,
  `toLocale*`, `localeCompare`; see `scripts/copy-polyfill.mjs`) are not in the
  supported list, so they are never selected.
