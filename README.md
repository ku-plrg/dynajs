# dynajs - Dynamic Analysis Framework for JavaScript

## Installation

```shell
npm install
npm run build
```

## Usage

```
Usage: dynajs <command> [options]

Commands:
  dynajs instrument  Instrument a JS file

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --detail   Show detailed process                                     [boolean]

Examples:
  dynajs instrument input.js  Instrument a JS file

You need a command to run `dynajs.`
```

## For Developers

During the development, you can use the following command to run the
`dynajs` tool with automatic rebuilding on file changes and detailed
logging messages:

```shell
npm run start:watch -- instrument --detail <js file>
```

> [!WARNING] The watch mode does not update `dist/` directory.  You need to run
> `npm run build` to update `dist/` directory.
