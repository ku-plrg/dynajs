# DynaJS - Dynamic Analysis Framework for JavaScript

> [!CAUTION]
> DynaJS is still in an early alpha stage of development. Its internal design and APIs are not yet stable and may change significantly.

DynaJS is a versatile dynamic analysis framework that scales from
linter-level lightweight dynamic analysis all the way to spec-faithful
shadow execution, ready out of the box.

```js
// example: count-calls.js
(function (D$) {
  let calls = 0;
  D$.analysis = {
    invokeFunPre(id, f, base, args) {
      console.log(`call @ ${D$.idToLoc(id)}`);
      calls++;
    },
    endExecution() {
      console.log(`${calls} calls total`);
    },
  };
})(D$);
```

```shell
./djx run -a ./count-calls.js -- node app.js
```

## Why DynaJS

- **Modern JavaScript Support** Private fields, optional chaining
  and nullish coalescing, `async`/`await`, generators, tagged templates,
  `super`, class fields, spread, and `BigInt` are all instrumented and hookable without using down-transpiling using Babel.
- **Hierarchical hooks.** Listen broadly (`binary`, `literal`, `condition`) or
  narrowly (`arithmeticBinary`, `stringLiteral`, `ifCondition`). General hooks
  fire first; specific ones refine them.
- **Pay only for what you hook.** *Partial* instrumentation inspects which
  callbacks you defined and rewrites only the matching syntax, keeping overhead
  proportional to your analysis.
- **Batteries included.** A shadow engine with spec-faithful ECMAScript abstract-operation models,
  and a shelf of ready-to-run sample analyses.
- **Transparent injection.** DynaJS wires itself in through `NODE_OPTIONS`, so
  it wraps any Node-based command - `node target.js`, `npm test`, `npx …` -
  without touching your code or your toolchain. CommonJS, ESModules, and even
  `node:vm` are all supported.

## Installation

```shell
npm install
npm run build
export DYNAJS_HOME=/path/to/repo
ln -s $DYNAJS_HOME/bin/dynajs ~/bin/dynajs   # or wherever your PATH points
ln -s $DYNAJS_HOME/bin/djx    ~/bin/djx      # or wherever your PATH points
```

## Usage

### `djx` (frontend)

`./djx` bundles the most common workflows into one command:

```shell
./djx run (-p <preset> | -a <path> | --bare) [opts] -- <cmd...>
                                   # wraps dynajs; target command goes after `--`
./djx instrument [--verbose] <file># static instrumentation (writes a *__dynajs__.js sibling)
./djx clean [dir]                  # removes generated *__dynajs__.js files
./djx list                         # lists built presets and bundled samples
./djx completion [zsh|bash]        # print a shell completion script (eval to enable)
./djx help
```

`djx run` picks the analysis via `-p/--preset <name>` (a built preset like
`taint`/`concolic` or a bundled `examples/simple/<Name>.js`), `-a/--analysis <path>`
(custom file), or `--bare` (instrument only, no analysis). Forwarded dynajs
flags: `--verbose`, `--partial`, `--full`, `--ignore-node-modules`, `--pos`,
`--home`, `--include`. Run `./djx list` to discover presets and samples, and
`./djx run --help` for the full flag list.

### `dynajs` (low-level)

Set `DYNAJS_OPTIONS` and run your usual command through `dynajs`:

```shell
DYNAJS_OPTIONS='--analysis ./examples/simple/TraceAll.js' dynajs node target.js
DYNAJS_OPTIONS='--analysis ./examples/simple/TraceAll.js' dynajs npm run test
DYNAJS_OPTIONS='--analysis ./examples/simple/TraceAll.js --partial' dynajs node target.js
```

> [!IMPORTANT]
>
> **Only files under an _include root_ are instrumented.** The include roots are
> the current working directory plus any `--include <path>` (or `DYNAJS_INCLUDE`,
> a path-delimited list). A target file outside every include root runs
> **uninstrumented** - no hooks fire, so the analysis silently sees nothing and
> the program behaves as plain Node. This is independent of `--partial`, which
> only selects _which hooks_ are enabled, not _which files_ are instrumented.
>
> Common gotcha: running a script that lives outside the repo (e.g. in `/tmp`)
> while `cwd` is the repo will leave it uninstrumented and can produce a
> misleading "pass". Pass `--include <dir>` for any target outside the cwd.

## Writing a simple analysis

An analysis is a code that assigns a callback to `D$.analysis`. Implement
any subset of the callbacks - in **partial mode**, only the hooks you define are
activated, so unused syntax stays untouched.

```js
(function (D$) {
  D$.analysis = {
    getField(id, base, prop, result, isPrivate) { /* observe a property read */ },
    binary(id, op, left, right, result)         { /* observe an operator      */ },
  };
})(D$);
```

## Writing a shadow execution analysis

DynaJS ships the hard part for shadow execution - lifting values across the
native/instrumented boundary, coercions, and builtins modeled against
the ECMAScript spec — as the `ShadowExecution<Info>` base class.
You supply only the **transfer functions**: how your shadow value flows.

Refer to the examples: [`examples/taint`](./examples/taint) and [`examples/concolic`](./examples/concolic).

## License

[BSD-3-Clause](./LICENSE)