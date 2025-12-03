import {
  log,
  err,
  stringify,
  VarKind,
  varKindToString,
} from './utils';
import * as utils from './utils';

// -----------------------------------------------------------------------------
// analysis templates
// -----------------------------------------------------------------------------
type Analysis = {
  endExpression?: (id: number, value: any) => void;
  binaryPre?: (id: number, op: string, left: any, right: any) => void;
  binaryPost?: (id: number, op: string, left: any, right: any, result: any) => void;
  unaryPre?: (id: number, op: string, operand: any) => void;
  unaryPost?: (id: number, op: string, operand: any, result: any) => void;
  condition?: (id: number, op: string, value: any) => void;
  declare?: (id: number, name: string, kind: string) => void;
  read?: (id: number, name: string, value: any) => void;
  write?: (id: number, names: string[], value: any) => void;
  literal?: (id: number, value: any, type: number) => void;
  scriptEnter?: (id: number, instrumentedPath: string, originalPath: string) => void;
  scriptExit?: (id: number) => void;
  endExecution?: () => void;
  uncaughtException?: any;
  result?: any;
}

// -----------------------------------------------------------------------------
// hooks for dynamic analysis
// -----------------------------------------------------------------------------
// hook for the end of an expression
function E(id: number, value: any): any {
  D$.analysis.endExpression?.(id, value);
  return value;
}

// hook for the end of an expression
function B(id: number, op: string, left: any, right: any): any {
  D$.analysis.binaryPre?.(id, op, left, right);
  const f = BINARY_OPS[op];
  if (!f) {
    err(`unknown binary operator ${op}`);
  }
  const result = f(left, right)
  D$.analysis.binaryPost?.(id, op, left, right, result);
  return result;
}
const BINARY_OPS: { [op: string]: (a: any, b: any) => any } = {
  "==": (a: any, b: any) => a == b,
  "!=": (a: any, b: any) => a != b,
  "===": (a: any, b: any) => a === b,
  "!==": (a: any, b: any) => a !== b,
  "<": (a: any, b: any) => a < b,
  "<=": (a: any, b: any) => a <= b,
  ">": (a: any, b: any) => a > b,
  ">=": (a: any, b: any) => a >= b,
  "<<": (a: any, b: any) => a << b,
  ">>": (a: any, b: any) => a >> b,
  ">>>": (a: any, b: any) => a >>> b,
  "+": (a: any, b: any) => a + b,
  "-": (a: any, b: any) => a - b,
  "*": (a: any, b: any) => a * b,
  "/": (a: any, b: any) => a / b,
  "%": (a: any, b: any) => a % b,
  "|": (a: any, b: any) => a | b,
  "^": (a: any, b: any) => a ^ b,
  "&": (a: any, b: any) => a & b,
  "in": (a: any, b: any) => a in b,
  "instanceof": (a: any, b: any) => a instanceof b,
  "**": (a: any, b: any) => a ** b,
}

// hook for unary operations (except for `delete`)
function U(id: number, op: string, operand: any): any {
  D$.analysis.unaryPre?.(id, op, operand);
  const f = UNARY_OPS[op];
  if (!f) {
    err(`unknown unary operator ${op}`);
  }
  const result = f(operand)
  D$.analysis.unaryPost?.(id, op, operand, result);
  return result;
}
const UNARY_OPS: { [op: string]: (a: any) => any } = {
  "-": (a: any) => -a,
  "+": (a: any) => +a,
  "!": (a: any) => !a,
  "~": (a: any) => ~a,
  "typeof": (a: any) => typeof a,
  "void": (a: any) => void a,
}

// hook for condition expressions
function C(id: number, op: string, value: any): any {
  D$.analysis.condition?.(id, op, value);
  return value;
}

// hook for variable declarations
function D(id: number, name: string, kind: VarKind): void {
  D$.analysis.declare?.(id, name, varKindToString(kind));
}

// hook for variable reads
function R(id: number, name: string, value: any): any {
  D$.analysis.read?.(id, name, value);
  return value;
}

// hook for variable writes
function W(id: number, names: string[], value: any): any {
  D$.analysis.write?.(id, names, value);
  return value;
}

// hook for literals
function L(id: number, value: any, type: number): any {
  D$.analysis.literal?.(id, value, type);
  return value;
}

// hook for uncaught exceptions
function X(id: number, exception: any): void {
  D$.analysis.uncaughtException = { exception };
}

// hook for script entry
function Se(id: number, instrumentedPath: string, originalPath: string): void {
  D$.analysis.scriptEnter?.(id, instrumentedPath, originalPath);
}

// hook for script exit
function Sx(id: number): void {
  const exc = D$.analysis.uncaughtException;
  D$.analysis.scriptExit?.(id);
  if (exc) {
    const tmp = exc.exception;
    D$.analysis.uncaughtException = undefined;
    throw tmp;
  }
}

// get the location string from an id
function idToLoc(id: number) {
  var [ startRow, startCol, endRow, endCol ] = D$.ids[id];
  return startRow == endRow
    ? `${startRow}:${startCol}-${endCol}`
    : `${startRow}:${startCol}-${endRow}:${endCol}`;
};

// -----------------------------------------------------------------------------
// assign to the global D$ variable
// -----------------------------------------------------------------------------
const BASE = {
  analysis: {},
  ids: {},
  idToLoc,
  utils,
  E, B, U, C, D, R, W, L, X, Se, Sx
};
type DynaJSType = typeof BASE & {
  analysis: Analysis;
  idToLoc: (id: number) => string;
  ids: Record<string, [number, number, number, number]>;
}

declare global { var D$: DynaJSType; };
globalThis.D$ = BASE;
