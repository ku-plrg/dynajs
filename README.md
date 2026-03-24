# dynajs - Dynamic Analysis Framework for JavaScript

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


## Legacy CLI

`./dynajs-legacy` keeps the previous CLI for direct `instrument` / `analyze`
commands:

```shell
./dynajs-legacy instrument input.js
./dynajs-legacy analyze -a samples/TraceAll.js input.js
```

Standalone `instrument` mode is not currently supported through the new
`./dynajs` entrypoint.

## For Developers

Use the watch command below while developing the legacy CLI implementation:

```shell
npm run start:watch -- instrument --verbose <js file>
```

> [!WARNING]
>
> The watch mode does not update `dist/` directory. Run `npm run build` before
> using `./dynajs` or `./dynajs-legacy` after modifying the source code.

### Testing

You can run the test suite with the following command:

```shell
./run-tests.sh
```

To run npm-based workflows with dynajs, use the new wrapper style:

```shell
DYNAJS_OPTIONS='--analysis ./samples/TraceAll.js' ./dynajs npm run test
```

#### Watching Mode

If you want to turn on watching mode for tests, you can use:
```shell
./run-tests.sh --watch
```
or
```shell
./run-tests.sh -W
```

#### Output Update Mode

If you want to update expected outputs for tests, you can use:
```shell
./run-tests.sh --update
```
or
```shell
./run-tests.sh -U
```

It is based on [`pytest`](https://docs.pytest.org/), so you can also use any
`pytest` options. If you want to see more options, you can run:
```shell
./run-tests.sh --help
```
