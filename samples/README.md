# Samples

Hand-written example analyses for DynaJS. Each file sets `D$.analysis = {...}` and is loaded at runtime via `--analysis`:

## See also: `<root>/analyses/`

For analyses that benefit from TypeScript type checking and bundling (e.g., taint analysis, concolic execution), see `<root>/analyses/`. Those are written in TS, type-checked against the `Analysis` type from `@dynajs/types/analysis.js`, and bundled by `npm run build` into `<root>/analyses/dist/*.js` — loaded the same way via `--analysis`.

Use this directory (`samples/`) for quick, single-file, JS-only analyses; use `analyses/` when you want a build-time-checked, possibly multi-file analysis.
