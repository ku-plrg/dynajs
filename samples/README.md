# Samples

Hand-written example analyses for DynaJS. Each file sets `D$.analysis = {...}` and is loaded at runtime via `--analysis`:

## Type checking

These stay plain `.js` — directly loadable, no build step — but are still
type-checked against the `Analysis` type via `tsconfig.json` (`allowJs` +
`checkJs`). `D$` is typed globally through `globals.d.ts`, so assigning a hook
object to `D$.analysis` is checked field-by-field; a misnamed or misshapen hook
fails `npm run typecheck:samples` (also part of `npm run build`). Helper
functions need JSDoc `@param` annotations under `strict`.

`CompareSome.js` is a dual-runtime harness (DynaJS `D$` **and** Jalangi `J$`):
it writes the trace logic once as a typed `Analysis`, then an `installOnJalangi`
adapter bridges Jalangi's differing calling conventions onto the same hooks.
`J$` is the only untyped surface and is confined to that adapter.

## See also: `<root>/analyses/`

For analyses that benefit from TypeScript type checking and bundling (e.g., taint analysis, concolic execution), see `<root>/analyses/`. Those are written in TS, type-checked against the `Analysis` type from `@dynajs/types/analysis.js`, and bundled by `npm run build` into `<root>/analyses/dist/*.js` — loaded the same way via `--analysis`.

Use this directory (`samples/`) for quick, single-file, JS-only analyses; use `analyses/` when you want a build-time-checked, possibly multi-file analysis.
