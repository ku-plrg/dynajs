import {
  VarKind,
  err,
  kindToStr,
  log,
  stringify,
  todo,
} from './utils';
import * as utils from './utils';

// -----------------------------------------------------------------------------
// analysis templates
// -----------------------------------------------------------------------------
type Analysis = {
  endExecution?: () => void;
  scriptEnter?: (id: number, instrumentedPath: string, originalPath: string) => void;
  scriptExit?: (id: number, exc?: { exception: any }) => void;
  invokeFunPre?: (id: number, f: any, base: any, args: IArguments, isConstructor: boolean, isMethod: boolean) => void;
  invokeFun?: (id: number, f: any, base: any, args: IArguments, result: any, isConstructor: boolean, isMethod: boolean) => void;
  functionEnter?: (id: number, f: any, base: any, args: IArguments) => void;
  functionExit?: (id: number, returnValue: any, exception?: { exception: any }) => void;
  _return?: (id: number, value: any) => void;
  endExpression?: (id: number, value: any) => void;
  binaryPre?: (id: number, op: string, left: any, right: any) => void;
  binaryPost?: (id: number, op: string, left: any, right: any, result: any) => void;
  unaryPre?: (id: number, op: string, prefix: boolean, operand: any) => void;
  unaryPost?: (id: number, op: string, prefix: boolean, operand: any, result: any) => void;
  condition?: (id: number, op: string, value: any) => void;
  declare?: (id: number, name: string, kind: string, init: boolean, value: any) => void;
  read?: (id: number, name: string, value: any) => void;
  write?: (id: number, names: string[], value: any) => void;
  literal?: (id: number, value: any, type: number) => void;
  _throw?: (id: number, val: any) => never;
  result?: any;
}

// stack to store return values
let returnStack: any[] = [];

// store uncaught exception
let uncaughtException: { exception: any } | undefined = undefined;

// store left side of a switch statement
let switchLeft: any = undefined;
let switchStack: any[] = [];
function pushSwitchLeft() { switchStack.push(switchLeft); }
function popSwitchLeft() { switchLeft = switchStack.pop(); }

// -----------------------------------------------------------------------------
// hooks for dynamic analysis
// -----------------------------------------------------------------------------

// hook for script enter
function Se(id: number, instrumentedPath: string, originalPath: string): void {
  D$.analysis.scriptEnter?.(id, instrumentedPath, originalPath);
}

// hook for script exit
function Sx(id: number): void {
  const exc = uncaughtException;
  D$.analysis.scriptExit?.(id, exc);
  if (exc) {
    const { exception } = exc;
    uncaughtException = undefined;
    throw exception;
  }
}

// hook for function calls
function F(id: number, f: any, isConstructor: boolean): any {
  return function(this: any) {
    return invokeFun(id, this, f, arguments, isConstructor, false);
  }
}

// helper function to invoke a function
function invokeFun(
  id: number,
  base: any,
  f: any,
  args: IArguments,
  isConstructor: boolean,
  isMethod: boolean,
) {
  let result: any;
  D$.analysis.invokeFunPre?.(id, f, base, args, isConstructor, isMethod);
  if (isConstructor) {
    todo('constructor calls not supported yet');
  } else {
    result = Function.prototype.apply.call(f, base, args);
  }
  D$.analysis.invokeFun?.(id, f, base, args, result, isConstructor, isMethod);
  return result;
}

// hook for function enter
function Fe(id: number, f: any, base: any, args: IArguments): void {
  returnStack.push(undefined);
  pushSwitchLeft();
  D$.analysis.functionEnter?.(id, f, base, args);
}

// hook for function exit
function Fx(id: number, result: any): void {
  const exc = uncaughtException;
  const ret = returnStack.pop();
  popSwitchLeft();
  D$.analysis.functionExit?.(id, ret, exc);
  if (exc) {
    const { exception } = exc;
    uncaughtException = undefined;
    throw exception;
  }
}

// hook for return statements
function Re(id: number, value: any): any {
  D$.analysis._return?.(id, value);
  returnStack[returnStack.length - 1] = value;
  return value;
}

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
  D$.analysis.unaryPre?.(id, op, true, operand);
  const f = UNARY_OPS[op];
  if (!f) {
    err(`unknown unary operator ${op}`);
  }
  const result = f(operand)
  D$.analysis.unaryPost?.(id, op, true, operand, result);
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

// hook for update operations
function Up(id: number, binaryId: number, op: string, prefix: boolean, argument: any, write: (x: any) => any): any {
  D$.analysis.unaryPre?.(id, op, prefix, argument);
  const oldValue = -(-argument);
  const binaryOp = op === '++' ? '+' : '-';
  const right = typeof oldValue == 'bigint' ? 1n : 1;
  D$.analysis.binaryPre?.(binaryId, binaryOp, oldValue, right);
  // @ts-ignore
  let newValue = op === '++' ? oldValue + right : oldValue - right;
  D$.analysis.binaryPost?.(binaryId, binaryOp, oldValue, right, newValue);
  write(newValue);
  const result = prefix ? newValue : oldValue;
  D$.analysis.unaryPost?.(id, op, prefix, argument, result);
  return result;
}

// hook for condition expressions
function C(id: number, op: string, value: any): any {
  D$.analysis.condition?.(id, op, value);
  return value;
}

// hook for left side of a switch statement
function Swl(id: number, value: any): any {
  return (switchLeft = value);
}

// hook for right side of a switch case
function Swr(id: number, caseValue: any): any {
  const result = B(id, '===', switchLeft, caseValue);
  return C(id, 'switch', result);
}

// hook for variable declarations
function D(id: number, name: string, kind: VarKind, value?: any): void {
  const init = arguments.length >= 4;
  D$.analysis.declare?.(id, name, kindToStr[kind], init, value);
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

// hook for throw statements
function Th(id: number, value: any): any {
  D$.analysis._throw?.(id, value);
  return value;
}

// hook for uncaught exceptions
function X(id: number, exception: any): void {
  uncaughtException = { exception };
}

// get the location string from an id
function idToLoc(id: number) {
  const [ startRow, startCol, endRow, endCol ] = D$.ids[id];
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
  Se, Sx, F, Fe, Fx, Re, E, B, U, Up, C, Swl, Swr, D, R, W, L, Th, X
};
type DynaJSType = typeof BASE & {
  analysis: Analysis;
  idToLoc: (id: number) => string;
  ids: Record<string, [number, number, number, number]>;
}

declare global { var D$: DynaJSType; };
globalThis.D$ = BASE;
