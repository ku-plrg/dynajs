import chalk from 'chalk';
import inspect from 'object-inspect';
import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import { ECMA_VERSION, EXIT_CODE_TODO, SCRIPT_NAME } from './constant.js';
import type { Program, Node } from 'acorn';

enum LogLevel {
  LOG,
  WARN,
  ERROR,
}

export function readFile(filename: string): string {
  if (!fs.existsSync(filename)) err(`File not found: \`${filename}\`.`);
  return fs.readFileSync(filename, 'utf-8').toString();
}

export function walkDir(
  dir: string,
  callback: (filename: string) => void,
): void {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

export function writeFile(filename: string, content: string): void {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, content);
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1];
}

export function getNameaWithExtension(filename: string): [string, string] {
  const ext = getExtension(filename);
  if (ext === '') return [filename, ''];
  return [filename.substring(0, filename.length - ext.length - 1), ext];
}

export function getNameWithoutExtension(filename: string): string {
  const ext = getExtension(filename);
  if (ext === '') return filename;
  return filename.substring(0, filename.length - ext.length - 1);
}

export function getInstrumentedName(filename: string): string {
  const name = getNameWithoutExtension(filename);
  return `${name}__${SCRIPT_NAME}__.js`;
}

export function getStatName(filename: string): string {
  const name = getNameWithoutExtension(filename);
  return `${name}__${SCRIPT_NAME}__.dynajs-stats-json`;
}

export function getArgs(cmd: string, argv: any, expected: number): string[] {
  if (argv._.length - 1 != expected) {
    err(`Exactly ${expected} arguments are required for \`${cmd}\`.`);
  }
  return argv._.slice(1);
}

export function readJSON(filename: string): any {
  return JSON.parse(readFile(filename));
}

export function getString(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value.hasOwnProperty('toString')) return value.toString();
  return inspect(value, { depth: 3 });
}

export function stringify(value: any): string {
  return JSON.stringify(
    value,
    (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n'; // 구분을 위해 'n'을 붙여주는 것이 관례
      }
      return value;
    },
    2,
  );
}

export const BAR = '-'.repeat(80);

export function log(
  value: any,
  color: (msg: string) => string = chalk.white,
  level: LogLevel = LogLevel.LOG,
  header: string = 'INFO',
  customExitCode: number | undefined = undefined,
) {
  if (customExitCode !== undefined) {
    process.exitCode = customExitCode;
  }
  let print;
  switch (level) {
    case LogLevel.LOG:
      print = console.log;
      break;
    case LogLevel.WARN:
      print = console.warn;
      break;
    case LogLevel.ERROR:
      print = (msg: string) => {
        throw msg;
      };
      break;
  }
  const msg = color(`[${header.padEnd(5, ' ')}] ${getString(value)}`);
  if (level === LogLevel.ERROR) throw msg;
  print(msg);
}

export function header(msg: string): void {
  log(BAR);
  log(msg);
  log(BAR);
}

export function warn(value: any) {
  log(value, chalk.yellow, LogLevel.WARN, 'WARN');
}

export function err(value: any) {
  log(value, chalk.red, LogLevel.ERROR, 'ERROR');
}

export function raise(value: any): never {
  err(value);
  throw new Error(getString(value));
}

export function todo(msg: string = '') {
  log(msg, chalk.red, LogLevel.ERROR, 'TODO', EXIT_CODE_TODO);
}

export function parse(code: string, isScript: boolean): Program {
  const sourceType = isScript ? 'script' : 'module';
  return acorn.parse(code, {
    locations: true,
    ecmaVersion: ECMA_VERSION,
    sourceType,
  });
}

export function inputValidCheck(inputs: any): void {
  if (!Array.isArray(inputs)) {
    err('Input set must be an array.');
  } else {
    inputs.forEach((input) => {
      if (!Array.isArray(input)) {
        err(`Input must be an array -- ${getString(input)}`);
      }
    });
  }
}

export class Cursor {
  index: number;
  line: number;
  col: number;
  constructor(code: string, index: number) {
    const lines = code.substring(0, index).split('\n');
    this.index = index;
    this.line = lines.length;
    this.col = index - lines.slice(0, -1).join('\n').length;
  }
  toString = (): string => `${this.line}:${this.col}`;
}

export class Range {
  start: Cursor;
  end: Cursor;
  constructor(start: Cursor, end: Cursor) {
    this.start = start;
    this.end = end;
  }
  static fromCode(code: string, start: number, end: number): Range {
    return new Range(new Cursor(code, start), new Cursor(code, end));
  }
  static fromNode(code: string, node: Node): Range {
    return Range.fromCode(code, node.start, node.end);
  }

  toString = (): string => `${this.start.toString()}-${this.end.toString()}`;
}

export class StringBuilder {
  indent: string;
  result: string;
  useResult: boolean;
  depth: number;
  constructor(useResult: boolean = true, indent: string = '  ') {
    this.indent = indent;
    this.result = '';
    this.useResult = useResult;
    this.depth = 0;
  }
  put = (str: string): string => {
    const line = this.indent.repeat(this.depth) + str;
    // NOTE this might cause error if string is too long (analyzing large code)
    if (this.useResult) {
      this.result += line + '\n';
    }
    return line;
  };
  indentIn = (): void => {
    this.depth += 1;
  };
  indentOut = (): void => {
    if (this.depth > 0) this.depth -= 1;
  };
}

export enum VarKind {
  Var = 0,
  Let = 1,
  Const = 2,
  Func = 3,
  Param = 4,
  Arguments = 5,
  CatchParam = 6,
  Class = 7,
}

export const strToKind: { [key: string]: VarKind } = {
  var: VarKind.Var,
  let: VarKind.Let,
  const: VarKind.Const,
  function: VarKind.Func,
  param: VarKind.Param,
  arguments: VarKind.Arguments,
  catch: VarKind.CatchParam,
  class: VarKind.Class,
};

export const kindToStr: { [key in VarKind]: string } = {
  [VarKind.Var]: 'var',
  [VarKind.Let]: 'let',
  [VarKind.Const]: 'const',
  [VarKind.Func]: 'function',
  [VarKind.Param]: 'param',
  [VarKind.Arguments]: 'arguments',
  [VarKind.CatchParam]: 'catch',
  [VarKind.Class]: 'class',
};

export const locToStr = (loc: [number, number, number, number]): string => {
  if (Array.isArray(loc)) {
    const [startRow, startCol, endRow, endCol] = loc;
    return startRow == endRow
      ? `${startRow}:${startCol}-${endCol}`
      : `${startRow}:${startCol}-${endRow}:${endCol}`;
  }
  return 'unknown location';
};

export const getLocFromNode = (
  node: Node,
): [number, number, number, number] => {
  if (!node.loc) return [-1, -1, -1, -1];
  return [
    node.loc.start.line,
    node.loc.start.column + 1,
    node.loc.end.line,
    node.loc.end.column + 1,
  ];
};
