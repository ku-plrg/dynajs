import {
  VarKind,
  err,
  kindToStr,
  locToStr,
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
  scriptEnter?: (
    id: number,
    instrumentedPath: string,
    originalPath: string
  ) => void;
  scriptExit?: (
    id: number,
    exc?: { exception: any }
  ) => void;
  invokeFunPre?: (
    id: number,
    f: any,
    base: any,
    args: any,
    isConstructor: boolean,
    isMethod: boolean
  ) => { f: any, base: any, args: any, skip: boolean } | void;
  invokeFun?: (
    id: number,
    f: any,
    base: any,
    args: any,
    result: any,
    isConstructor: boolean,
    isMethod: boolean
  ) => { result: any } | void;
  functionEnter?: (
    id: number,
    f: any,
    base: any,
    args: any
  ) => void;
  functionExit?: (
    id: number,
    returnValue: any,
    exception?: { exception: any }
  ) => void;
  _return?: (
    id: number,
    value: any
  ) => { result: any } | void;
  forInOfObject?: (
    id: number,
    value: any,
    isForIn: boolean
  ) => { result: any } | void;
  endExpression?: (
    id: number,
    value: any
  ) => void;
  getFieldPre?: (
    id: number,
    base: any,
    prop: any
  ) => { base: any, prop: any, skip: boolean } | void;
  getField?: (
    id: number,
    base: any,
    prop: any,
    result: any
  ) => { result: any } | void;
  putFieldPre?: (
    id: number,
    base: any,
    prop: any,
    value: any
  ) => { base: any, prop: any, value: any, skip: boolean } | void;
  putField?: (
    id: number,
    base: any,
    prop: any,
    value: any
  ) => { result: any } | void;
  _deletePre?: (
    id: number,
    base: any,
    prop: any
  ) => { base: any, prop: any, skip: boolean } | void;
  _delete?: (
    id: number,
    base: any,
    prop: any,
    value: boolean
  ) => { result: boolean } | void;
  unaryPre?: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any
  ) => { op: string, operand: any, skip: boolean } | void;
  unary?: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any
  ) => { result: any } | void;
  binaryPre?: (
    id: number,
    op: string,
    left: any,
    right: any
  ) => { op: string, left: any, right: any, skip: boolean } | void;
  binary?: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any
  ) => { result: any } | void;
  condition?: (
    id: number,
    op: string,
    value: any
  ) => { result: any } | void;
  declare?: (
    id: number,
    name: string,
    kind: string,
    init: boolean,
    value: any
  ) => void;
  read?: (
    id: number,
    name: string,
    value: any
  ) => { result: any } | void;
  write?: (
    id: number,
    names: string[],
    value: any
  ) => { result: any } | void;
  literal?: (
    id: number,
    value: any
  ) => { result: any } | void;
  _throw?: (
    id: number,
    val: any
  ) => { result: any } | void;
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

// hook for method calls
function M(id: number, base: any, prop: any, isConstructor: boolean): any {
  const f = G(id, base, prop);
  return function() {
    return invokeFun(id, base, f, arguments, isConstructor, true);
  }
}

// helper function to invoke a function
function invokeFun(
  id: number,
  base: any,
  f: any,
  args: any,
  isConstructor: boolean,
  isMethod: boolean,
) {
  let result: any;
  let skip = false;
  const pre = D$.analysis.invokeFunPre?.(id, f, base, args, isConstructor, isMethod);
  if (pre) {
    f = pre.f;
    base = pre.base;
    args = pre.args;
    skip = pre.skip;
  }
  if (!skip) {
    if (isConstructor) {
      result = construct(f, args);
    } else {
      result = Function.prototype.apply.call(f, base, args);
    }
  }
  const post = D$.analysis.invokeFun?.(id, f, base, args, result, isConstructor, isMethod);
  if (post) result = post.result;
  return result;
}

// helper function to construct an object
function construct(f: any, args: any): any {
  if (typeof Reflect !== 'undefined' && Reflect.construct) {
    return Reflect.construct(f, args);
  } else {
    // for older environments without Reflect.construct
    switch (args.length) {
      case 0: return new f();
      case 1: return new f(args[0]);
      case 2: return new f(args[0], args[1]);
      case 3: return new f(args[0], args[1], args[2]);
      case 4: return new f(args[0], args[1], args[2], args[3]);
    }
    // for more than 4 arguments
    const argArray = Array.prototype.slice.call(args);
    const TempConstructor: any = function(this: any) {
      return f.apply(this, argArray);
    }
    TempConstructor.prototype = f.prototype;
    return new TempConstructor();
  }
}

// hook for function enter
function Fe(id: number, f: any, base: any, args: any): void {
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
  const post = D$.analysis._return?.(id, value);
  if (post) {
    value = post.result;
  }
  returnStack[returnStack.length - 1] = value;
  return value;
}

// hook for RHS object of for-in/of loops
function O(id: number, value: any, isForIn: boolean): any {
  const post = D$.analysis.forInOfObject?.(id, value, isForIn);
  if (post) value = post.result;
  return value;
}

// hook for the end of an expression
function E(id: number, value: any): any {
  D$.analysis.endExpression?.(id, value);
  return value;
}

// hook for property reads (get-field)
function G(id: number, base: any, prop: any): any {
  let skip = false;
  let value;
  const pre = D$.analysis.getFieldPre?.(id, base, prop);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
  }
  if (!skip) {
    value = base[prop];
  }
  const post = D$.analysis.getField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for property writes (set-field)
function P(id: number, base: any, prop: any, value: any): any {
  let skip = false;
  const pre = D$.analysis.putFieldPre?.(id, base, prop, value);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    value = pre.value;
    skip = pre.skip;
  }
  if (!skip) {
    base[prop] = value;
  }
  const post = D$.analysis.putField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for delete operations
function De(id: number, base: any, prop: any): boolean {
  let value = true;
  let skip = false;
  const pre = D$.analysis._deletePre?.(id, base, prop);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
  }
  if (!skip) {
    value = delete base[prop];
  }
  const post = D$.analysis._delete?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for unary operations (except for `delete`)
function U(id: number, op: string, operand: any): any {
  let value;
  let skip = false;
  const pre = D$.analysis.unaryPre?.(id, op, true, operand);
  if (pre) {
    op = pre.op;
    operand = pre.operand;
    skip = pre.skip
  }
  const f = UNARY_OPS[op];
  if (!f) {
    err(`unknown unary operator ${op}`);
  }
  if (!skip) {
    value = f(operand)
  }
  const post = D$.analysis.unary?.(id, op, true, operand, value);
  if (post) {
    value = post.result;
  }
  return value;
}
const UNARY_OPS: { [op: string]: (a: any) => any } = {
  "-": (a: any) => -a,
  "+": (a: any) => +a,
  "!": (a: any) => !a,
  "~": (a: any) => ~a,
  "typeof": (a: any) => typeof a,
  "void": (a: any) => void a,
}

// hook for the end of an expression
function B(id: number, op: string, left: any, right: any): any {
  let value;
  let skip = false;
  const pre = D$.analysis.binaryPre?.(id, op, left, right);
  if (pre) {
    op = pre.op;
    left = pre.left;
    right = pre.right;
    skip = pre.skip;
  }
  const f = BINARY_OPS[op];
  if (!f) {
    err(`unknown binary operator ${op}`);
  }
  if (!skip) {
    value = f(left, right)
  }
  const post = D$.analysis.binary?.(id, op, left, right, value);
  if (post) value = post.result;
  return value;
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

// hook for update operations
function Up(id: number, binaryId: number, op: string, prefix: boolean, argument: any, write: (x: any) => any): any {
  D$.analysis.unaryPre?.(id, op, prefix, argument);
  const oldValue = -(-argument);
  const binaryOp = op === '++' ? '+' : '-';
  const right = typeof oldValue == 'bigint' ? 1n : 1;
  D$.analysis.binaryPre?.(binaryId, binaryOp, oldValue, right);
  // @ts-ignore
  let newValue = op === '++' ? oldValue + right : oldValue - right;
  D$.analysis.binary?.(binaryId, binaryOp, oldValue, right, newValue);
  write(newValue);
  const result = prefix ? newValue : oldValue;
  D$.analysis.unary?.(id, op, prefix, argument, result);
  return result;
}

// hook for condition expressions
function C(id: number, op: string, value: any): any {
  const post = D$.analysis.condition?.(id, op, value);
  if (post) {
    value = post.result;
  }
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
  const post = D$.analysis.read?.(id, name, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for variable writes
function W(id: number, names: string[], value: any): any {
  const post = D$.analysis.write?.(id, names, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for literals
function L(id: number, value: any): any {
  let post = D$.analysis.literal?.(id, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for throw statements
function Th(id: number, value: any): any {
  const post = D$.analysis._throw?.(id, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for uncaught exceptions
function X(id: number, exception: any): void {
  uncaughtException = { exception };
}

// get the location string from an id
function idToLoc(id: number) {
  return locToStr(D$.ids[id]);
};

// -----------------------------------------------------------------------------
// assign to the global D$ variable
// -----------------------------------------------------------------------------
const BASE = {
  analysis: {},
  ids: {},
  idToLoc,
  utils,
  Se, Sx, F, M, Fe, Fx, Re, O, E, G, P, De,
  U, B, Up, C, Swl, Swr, D, R, W, L, Th, X
};
type DynaJSType = typeof BASE & {
  analysis: Analysis;
  idToLoc: (id: number) => string;
  ids: Record<string, [number, number, number, number]>;
}

declare global { var D$: DynaJSType; };
globalThis.D$ = BASE;
