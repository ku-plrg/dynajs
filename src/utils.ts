import { white, yellow, red } from 'chalk';
import inspect from 'object-inspect';
import fs from 'fs';
import path from 'path';
import dedent from 'dedent-js';
import * as acorn from 'acorn';
import {
  Program,
  Node,
  Literal,
  TemplateElement,
} from 'acorn';

import { SCRIPT_NAME } from './constants';

enum LogLevel {
  LOG,
  WARN,
  ERROR,
}

// read the file
export function readFile(filename: string): string {
  if (!fs.existsSync(filename)) err(`File not found: \`${filename}\`.`);
  return fs.readFileSync(filename, 'utf-8').toString();
}

// walk through a directory recursively
export function walkDir(dir: string, callback: (filename: string) => void): void {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);   // ⬅ 재귀 호출
    } else {
      callback(fullPath);            // ⬅ 파일 발견 시 callback 호출
    }
  });
}

// write the file
export function writeFile(filename: string, content: string): void {
  fs.writeFileSync(filename, content);
}

// get extension from a filename
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

// get name without extension from a filename
export function getNameWithoutExtension(filename: string): string {
  const ext = getExtension(filename);
  if (ext === '') return filename;
  return filename.substring(0, filename.length - ext.length - 1);
}

export function getInstrumentedName(filename: string): string {
  const name = getNameWithoutExtension(filename);
  return `${name}__${SCRIPT_NAME}__.js`;
}

// get command arguments
export function getArgs(cmd: string, argv: any, expected: number): string[] {
  if (argv._.length - 1 != expected) {
    err(`Exactly ${expected} arguments are required for \`${cmd}\`.`);
  }
  return argv._.slice(1);
}

// read the JSON file
export function readJSON(filename: string): any {
  return JSON.parse(readFile(filename));
}

// get the string representation of a value
export function getString(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value.hasOwnProperty('toString')) return value.toString();
  return inspect(value, { depth: 3 });
}

// get the JSON representation of a value
export function stringify(value: any): string {
  return JSON.stringify(value, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n'; // 구분을 위해 'n'을 붙여주는 것이 관례
    }
    return value;
  }, 2)
}

// a horizontal bar
export const BAR = '-'.repeat(80);

// log a message
export function log(
  value: any,
  color: (msg: string) => string = white,
  level: LogLevel = LogLevel.LOG,
  header: string = 'INFO',
) {
  let print;
  switch (level) {
    case LogLevel.LOG:
      print = console.log;
      break;
    case LogLevel.WARN:
      print = console.warn;
      break;
    case LogLevel.ERROR:
      print = (msg: string) => { throw msg; };
      break;
  }
  const msg = color(`[${header.padEnd(5, ' ')}] ${getString(value)}`);
  if (level === LogLevel.ERROR) throw msg;
  print(msg);
}

// header message
export function header(msg: string): void {
  log(BAR);
  log(msg);
  log(BAR);
}

// warning message
export function warn(value: any) {
  log(value, yellow, LogLevel.WARN, 'WARN');
}

// error message
export function err(value: any) {
  log(value, red, LogLevel.ERROR, 'ERROR');
}

// to-do message
export function todo(msg: string = '') {
  log(msg, red, LogLevel.ERROR, 'TODO');
}

// parse the string into an AST
export function parse(code: string): Program {
  return acorn.parse(code, {locations: true, ecmaVersion: 2025});
}

// input validity check
export function inputValidCheck(inputs: any): void {
  if (!Array.isArray(inputs)) {
    err('Input set must be an array.');
  } else {
    inputs.forEach(input => {
      if (!Array.isArray(input)) {
        err(`Input must be an array -- ${getString(input)}`);
      }
    });
  }
}

// cursor in the code
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

// range of code
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

// string builder
export class StringBuilder {
  indent: string;
  result: string;
  depth: number;
  constructor(indnet: string = "  ") {
    this.indent = indnet;
    this.result = "";
    this.depth = 0;
  }
  put = (str: string): void => {
    this.result += this.indent.repeat(this.depth) + str + "\n";
  }
  indentIn = (): void => {
    this.depth += 1;
  }
  indentOut = (): void => {
    if (this.depth > 0) this.depth -= 1;
  }
}
