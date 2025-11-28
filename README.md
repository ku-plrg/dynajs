# dynajs - Dynamic Analysis Framework for JavaScript

## Installation

```shell
npm install
npm run build
```

## Usage

```
Usage: ./dynajs <command> [options]

Commands:
  ./dynajs instrument  Instrument a JS file

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --detail   Show detailed process                                     [boolean]

Examples:
  ./dynajs instrument input.js  Instrument a JS file

You need a command to run `dynajs`.
```

## For Developers

During the development, you can use the following command to run the
`dynajs` tool with automatic rebuilding on file changes and detailed
logging messages:

```shell
npm run start:watch -- instrument --detail <js file>
```

> [!WARNING]
>
> The watch mode does not update `dist/` directory. You need to run `npm run
> build` to update `dist/` directory before using `dynajs` command after
> modifying the source code.

### Testing

You can run the test suite with the following command:

```shell
./run-tests.sh
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
