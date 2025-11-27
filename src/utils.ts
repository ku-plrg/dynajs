import { white, yellow, red } from 'chalk';
import inspect from 'object-inspect';

import * as acorn from 'acorn';
import {
  Program,
  Node,
  Literal,
  TemplateElement,
} from 'acorn';

import fs from 'fs';

import dedent from 'dedent-js';

enum LogLevel {
  LOG,
  WARN,
  ERROR,
}

export const scriptName = 'js-mutest';

// Read the file
export function readFile(path: string): string {
  if (!fs.existsSync(path)) err(`File not found: \`${path}\`.`);
  return fs.readFileSync(path, 'utf-8').toString().trim();
}

// Write the file
export function writeFile(path: string, content: string): void {
  fs.writeFileSync(path, content);
}

// Get extension from a path
export function getExtension(path: string): string {
  const parts = path.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1];
}

export function getNameWithoutExtension(path: string): string {
  const ext = getExtension(path);
  if (ext === '') return path;
  return path.substring(0, path.length - ext.length - 1);
}

export function getArgs(cmd: string, argv: any, expected: number): string[] {
  if (argv._.length - 1 != expected) {
    err(`Exactly ${expected} arguments are required for \`${cmd}\`.`);
  }
  return argv._.slice(1);
}

// Read the JSON file
export function readJSON(path: string): any {
  return JSON.parse(readFile(path));
}

// Get the string representation of a value
export function getString(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value.hasOwnProperty('toString')) return value.toString();
  return inspect(value, { depth: 3 });
}

// Get the JSON representation of a value
export function stringify(value: any): string {
  return JSON.stringify(value, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n'; // 구분을 위해 'n'을 붙여주는 것이 관례
    }
    return value;
  }, 2)
}

export const BAR = '-'.repeat(80);

// Log a message
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

// Header message
export function header(msg: string): void {
  log(BAR);
  log(msg);
  log(BAR);
}

// Warning message
export function warn(value: any) {
  log(value, yellow, LogLevel.WARN, 'WARN');
}

// Error message
export function err(value: any) {
  log(value, red, LogLevel.ERROR, 'ERROR');
}

// To-do message
export function todo(msg: string = '') {
  log(msg, red, LogLevel.ERROR, 'TODO');
}

// Parse the string into an AST
export function parse(code: string): Program {
  return acorn.parse(code, {ecmaVersion: 2023});
}

// Input validity check
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

// Cursor in the code
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

// Range of code
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
