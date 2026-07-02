# DynaJS - Dynamic Analysis Framework for JavaScript

## Installation

```shell
npm install
npm run build
```

## Usage

Set `DYNAJS_HOME` to the repository root before using `./dynajs`:

```shell
export DYNAJS_HOME=/path/to/repo
ln -s /path/to/repo/dynajs ~/bin/dynajs # or what ever PATH
```

Set `DYNAJS_OPTIONS` and run your usual command through `dynajs`:

```
DYNAJS_OPTIONS='--analysis ./samples/TraceAll.js' dynajs node target.js
DYNAJS_OPTIONS='--analysis ./samples/TraceAll.js' dynajs npm run test
DYNAJS_OPTIONS='--analysis ./samples/TraceAll.js --partial' dynajs node target.js
```

> [!IMPORTANT]
>
> **Only files under an _include root_ are instrumented.** The include roots are
> the current working directory plus any `--include <path>` (or `DYNAJS_INCLUDE`,
> a path-delimited list). A target file outside every include root runs
> **uninstrumented** — no hooks fire, so the analysis silently sees nothing and
> the program behaves as plain Node. This is independent of `--partial`, which
> only selects _which hooks_ are enabled, not _which files_ are instrumented.
>
> Common gotcha: running a script that lives outside the repo (e.g. in `/tmp`)
> while `cwd` is the repo will leave it uninstrumented and can produce a
> misleading "pass". Pass `--include <dir>` for any target outside the cwd.

## `djx` — convenience CLI

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
`taint`/`concolic` or a bundled `samples/<Name>.js`), `-a/--analysis <path>`
(custom file), or `--bare` (instrument only, no analysis). Forwarded dynajs
flags: `--verbose`, `--partial`, `--full`, `--ignore-node-modules`, `--pos`,
`--home`, `--include`.
Run `./djx run --help` for the full list.

## For Developers

> [!WARNING]
>
> The watch mode only typechecks. Run `npm run build` before using `./dynajs`
> or `./djx` after modifying the source code.

### Testing

The suite is built on Node's built-in [test runner](https://nodejs.org/api/test.html)
(no Python required). The `pretest` hook builds first, so every variant is just
`npm test` with different flags:

```shell
npm test                    # run the regression suite
npm test -- --name class    # only tests whose name matches a pattern (-n)
npm test -- --watch         # re-run on change (-w)
npm test -- --update        # rewrite mismatching .out snapshots (-u)
npm test -- --all           # regression + taint + concolic
```

The regression suite is split by what it checks. `tests/behavior.test.mjs`
verifies that instrumentation preserves program semantics — dynajs output is
compared against plain Node, in both `--partial` and `--full` mode.
`tests/snapshot.test.mjs` verifies that an analysis's emitted trace still matches
its golden `.out` file. Cases are discovered from the `tests/` fixture
directories; shared helpers live in `tests/support/`, and `scripts/run-tests.mjs`
parses the flags above. The `test:*` scripts are thin aliases that delegate
through `npm run test --`, so the build always runs exactly once via `pretest`:

```shell
npm run test:watch      # npm run test -- --watch
npm run test:update     # npm run test -- --update
npm run test:taint      # npm run test -- --taint
npm run test:concolic   # npm run test -- --concolic
npm run test:all        # npm run test -- --all
```

To run npm-based workflows with dynajs, use the wrapper style:

```shell
DYNAJS_OPTIONS='--analysis ./samples/TraceAll.js' ./dynajs npm run test
```
