import {
  VarKind,
  err,
  kindToStr,
  locToStr,
} from './utils.js';
import type { Analysis } from './types/analysis.js';
import type { RuntimeOptions } from './entry/options.js';
import * as utils from './utils.js';
import { instrument } from './instrument/main.js';
import { StateOption } from './instrument/state.js';

// sentinel symbol for optional chain short-circuit propagation
const chainSkip = Symbol('D$.chainSkip');

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
function F(id: number, f: any, isConstructor: boolean, callOptional: boolean): any {
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip) return () => chainSkip;
  }
  return function(this: any) {
    return invokeFun(id, this, f, arguments, isConstructor, false);
  }
}

// hook for method calls
function M(id: number, base: any, prop: any, isConstructor: boolean, memberOptional: boolean, callOptional: boolean): any {
  if (base === chainSkip) return () => chainSkip;
  if (memberOptional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return () => chainSkip;
  }
  let f = G(id, base, prop);
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip) return () => chainSkip;
  }
  return function() {
    return invokeFun(id, base, f, arguments, isConstructor, true);
  }
}

function Mp(
  id: number,
  base: any,
  prop: any,
  isConstructor: boolean,
  memberOptional: boolean,
  callOptional: boolean,
  getter: (base: any) => any,
): any {
  if (base === chainSkip) return () => chainSkip;
  if (memberOptional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return () => chainSkip;
  }
  let f = Gp(id, base, prop, getter);
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip) return () => chainSkip;
  }
  return function() {
    return invokeFun(id, base, f, arguments, isConstructor, true);
  }
}

// hook for tagged template function calls
function TF(id: number, f: any): any {
  return function(this: any, strings: any, ...values: any[]) {
    return invokeTT(id, this, f, strings, values, false);
  }
}

// hook for tagged template method calls
function TM(id: number, base: any, prop: any): any {
  const f = G(id, base, prop);
  return function(strings: any, ...values: any[]) {
    return invokeTT(id, base, f, strings, values, true);
  }
}

function TMp(id: number, base: any, prop: any, getter: (base: any) => any): any {
  const f = Gp(id, base, prop, getter);
  return function(strings: any, ...values: any[]) {
    return invokeTT(id, base, f, strings, values, true);
  }
}

// helper to invoke a tagged template call with hierarchical hooks (general-first, specific wins)
function invokeTT(id: number, base: any, f: any, strings: any, values: any[], isMethod: boolean): any {
  let result: any;
  let skip = false;
  let args: any[] = [strings, ...values];

  // General hook fires first
  const generalPre = D$.analysis.invokeFunPre?.(id, f, base, args, false, isMethod);
  if (generalPre) {
    f = generalPre.f;
    base = generalPre.base;
    args = generalPre.args;
    skip = generalPre.skip;
    strings = args[0];
    values = args.slice(1);
  }

  // Specific hook fires second and wins
  const specificPre = D$.analysis.taggedTemplatePre?.(id, f, base, strings, values, isMethod);
  if (specificPre) {
    f = specificPre.f;
    base = specificPre.base;
    strings = specificPre.strings;
    values = specificPre.values;
    skip = specificPre.skip;
  }

  if (!skip) {
    result = Function.prototype.apply.call(f, base, [strings, ...values]);
  }

  args = [strings, ...values];

  // General post-hook fires first
  const generalPost = D$.analysis.invokeFun?.(id, f, base, args, result, false, isMethod);
  if (generalPost) result = generalPost.result;

  // Specific post-hook fires second and wins
  const specificPost = D$.analysis.taggedTemplate?.(id, f, base, strings, values, result, isMethod);
  if (specificPost) result = specificPost.result;

  return result;
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
function Fe(id: number, f: any, base: any, args: any, isAsync: boolean, isGenerator: boolean): void {
  returnStack.push(undefined);
  pushSwitchLeft();
  D$.analysis.functionEnter?.(id, f, base, args, isAsync, isGenerator);
}

// hook for function exit
function Fx(id: number, isAsync: boolean, isGenerator: boolean): void {
  const exc = uncaughtException;
  const ret = returnStack.pop();
  popSwitchLeft();
  D$.analysis.functionExit?.(id, ret, exc, isAsync, isGenerator);
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
function G(id: number, base: any, prop: any, optional: boolean = false): any {
  if (base === chainSkip) return chainSkip;
  if (optional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return chainSkip;
  }
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
  // general memoryAccess fires first
  const generalPost = D$.analysis.memoryAccess?.(id, value);
  if (generalPost) value = generalPost.result;
  // specific getField fires second and wins
  const post = D$.analysis.getField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

function Gp(
  id: number,
  base: any,
  prop: any,
  getter: (base: any) => any,
  optional: boolean = false,
): any {
  if (base === chainSkip) return chainSkip;
  if (optional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return chainSkip;
  }
  let skip = false;
  let value;
  const pre = D$.analysis.getFieldPre?.(id, base, prop);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
  }
  if (!skip) {
    value = getter(base);
  }
  const generalPost = D$.analysis.memoryAccess?.(id, value);
  if (generalPost) value = generalPost.result;
  const post = D$.analysis.getField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for property writes (set-field)
function P(id: number, base: any, prop: any, value: any, strict: boolean = false): any {
  let skip = false;
  const pre = D$.analysis.putFieldPre?.(id, base, prop, value);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    value = pre.value;
    skip = pre.skip;
  }
  if (!skip) {
    if (strict || base === null || base === undefined) {
      base[prop] = value;
    } else if (typeof Reflect !== 'undefined' && Reflect.set) {
      Reflect.set(Object(base), prop, value);
    } else {
      Object(base)[prop] = value;
    }
  }
  // general memoryWrite fires first
  const generalPost = D$.analysis.memoryWrite?.(id, value);
  if (generalPost) value = generalPost.result;
  // specific putField fires second and wins
  const post = D$.analysis.putField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

function Pp(
  id: number,
  base: any,
  prop: any,
  value: any,
  writer: (base: any, value: any) => any,
): any {
  let skip = false;
  const pre = D$.analysis.putFieldPre?.(id, base, prop, value);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    value = pre.value;
    skip = pre.skip;
  }
  if (!skip) {
    writer(base, value);
  }
  const generalPost = D$.analysis.memoryWrite?.(id, value);
  if (generalPost) value = generalPost.result;
  const post = D$.analysis.putField?.(id, base, prop, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for delete operations
function De(id: number, base: any, prop: any, optional: boolean = false): any {
  if (base === chainSkip) return chainSkip;
  if (optional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return chainSkip;
  }
  let value = true;
  let skip = false;
  const pre = D$.analysis._deletePre?.(id, base, prop);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
  }
  if (!skip) {
    if (base === null || base === undefined) {
      value = delete base[prop];
    } else {
      const deleteTarget = Object(base);
      try {
        if (typeof Reflect !== 'undefined' && Reflect.deleteProperty) {
          value = Reflect.deleteProperty(deleteTarget, prop);
        } else {
          value = delete deleteTarget[prop];
        }
      } catch {
        value = false;
      }
    }
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
  // general pre fires first
  const pre = D$.analysis.unaryPre?.(id, op, true, operand);
  if (pre) {
    op = pre.op;
    operand = pre.operand;
    skip = pre.skip;
  }
  // specific pre fires second and wins
  const specificPre = fireSpecificUnaryPre(id, op, true, operand);
  if (specificPre) {
    op = specificPre.op;
    operand = specificPre.operand;
    skip = specificPre.skip;
  }
  const f = UNARY_OPS[op];
  if (!f) {
    err(`unknown unary operator ${op}`);
  }
  if (!skip) {
    value = f(operand)
  }
  // general post fires first
  const post = D$.analysis.unary?.(id, op, true, operand, value);
  if (post) {
    value = post.result;
  }
  // specific post fires second and wins
  const specificPost = fireSpecificUnary(id, op, true, operand, value);
  if (specificPost) {
    value = specificPost.result;
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

// helpers to fire specific binary pre/post callbacks based on op
function fireSpecificBinaryPre(id: number, op: string, left: any, right: any): { op: string, left: any, right: any, skip: boolean } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_BINARY_OPS.has(op)) cb = 'arithmeticBinaryPre';
  else if (COMPARISON_BINARY_OPS.has(op)) cb = 'comparisonBinaryPre';
  else if (BITWISE_BINARY_OPS.has(op)) cb = 'bitwiseBinaryPre';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, left, right);
}
function fireSpecificBinary(id: number, op: string, left: any, right: any, value: any): { result: any } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_BINARY_OPS.has(op)) cb = 'arithmeticBinary';
  else if (COMPARISON_BINARY_OPS.has(op)) cb = 'comparisonBinary';
  else if (BITWISE_BINARY_OPS.has(op)) cb = 'bitwiseBinary';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, left, right, value);
}
// helpers to fire specific unary pre/post callbacks based on op
function fireSpecificUnaryPre(id: number, op: string, prefix: boolean, operand: any): { op: string, operand: any, skip: boolean } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_UNARY_OPS.has(op)) cb = 'arithmeticUnaryPre';
  else if (op === '!') cb = 'logicalUnaryPre';
  else if (op === '~') cb = 'bitwiseUnaryPre';
  else if (op === 'typeof') cb = 'typeofUnaryPre';
  else if (op === 'void') cb = 'voidUnaryPre';
  else if (UPDATE_UNARY_OPS.has(op)) cb = 'updateUnaryPre';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, prefix, operand);
}
function fireSpecificUnary(id: number, op: string, prefix: boolean, operand: any, value: any): { result: any } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_UNARY_OPS.has(op)) cb = 'arithmeticUnary';
  else if (op === '!') cb = 'logicalUnary';
  else if (op === '~') cb = 'bitwiseUnary';
  else if (op === 'typeof') cb = 'typeofUnary';
  else if (op === 'void') cb = 'voidUnary';
  else if (UPDATE_UNARY_OPS.has(op)) cb = 'updateUnary';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, prefix, operand, value);
}

// hook for the end of an expression
function B(id: number, op: string, left: any, right: any): any {
  let value;
  let skip = false;
  // general pre fires first
  const pre = D$.analysis.binaryPre?.(id, op, left, right);
  if (pre) {
    op = pre.op;
    left = pre.left;
    right = pre.right;
    skip = pre.skip;
  }
  // specific pre fires second and wins
  const specificPre = fireSpecificBinaryPre(id, op, left, right);
  if (specificPre) {
    op = specificPre.op;
    left = specificPre.left;
    right = specificPre.right;
    skip = specificPre.skip;
  }
  const f = BINARY_OPS[op];
  if (!f) {
    err(`unknown binary operator ${op}`);
  }
  if (!skip) {
    value = f(left, right)
  }
  // general post fires first
  const post = D$.analysis.binary?.(id, op, left, right, value);
  if (post) value = post.result;
  // specific post fires second and wins
  const specificPost = fireSpecificBinary(id, op, left, right, value);
  if (specificPost) value = specificPost.result;
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
const ARITHMETIC_BINARY_OPS = new Set(['+', '-', '*', '/', '%', '**']);
const COMPARISON_BINARY_OPS = new Set(['==', '!=', '===', '!==', '<', '<=', '>', '>=', 'in', 'instanceof']);
const BITWISE_BINARY_OPS    = new Set(['&', '|', '^', '<<', '>>', '>>>']);
const ARITHMETIC_UNARY_OPS  = new Set(['+', '-']);
const UPDATE_UNARY_OPS      = new Set(['++', '--']);
const CONDITION_CB: Record<string, keyof Analysis> = {
  'if': 'ifCondition', 'while': 'whileCondition', 'do-while': 'whileCondition',
  'for': 'forCondition', '?': 'ternaryCondition',
  '&&': 'logicalAnd', '||': 'logicalOr', '??': 'nullishCoalescing',
  '?.': 'optionalChain', 'switch': 'switchCondition',
};

// hook for update operations
function Up(id: number, binaryId: number, op: string, prefix: boolean, argument: any, write: (x: any) => any): any {
  D$.analysis.unaryPre?.(id, op, prefix, argument);
  fireSpecificUnaryPre(id, op, prefix, argument);
  const oldValue = -(-argument);
  const binaryOp = op === '++' ? '+' : '-';
  const right = typeof oldValue == 'bigint' ? 1n : 1;
  D$.analysis.binaryPre?.(binaryId, binaryOp, oldValue, right);
  fireSpecificBinaryPre(binaryId, binaryOp, oldValue, right);
  // @ts-ignore
  let newValue = op === '++' ? oldValue + right : oldValue - right;
  D$.analysis.binary?.(binaryId, binaryOp, oldValue, right, newValue);
  fireSpecificBinary(binaryId, binaryOp, oldValue, right, newValue);
  write(newValue);
  const result = prefix ? newValue : oldValue;
  D$.analysis.unary?.(id, op, prefix, argument, result);
  fireSpecificUnary(id, op, prefix, argument, result);
  return result;
}

// hook for condition expressions
function C(id: number, op: string, value: any): any {
  // general condition fires first
  const post = D$.analysis.condition?.(id, op, value);
  if (post) {
    value = post.result;
  }
  // specific condition callback fires second and wins
  const specificKey = CONDITION_CB[op];
  if (specificKey) {
    const specificPost = (D$.analysis[specificKey] as any)?.(id, value);
    if (specificPost) value = specificPost.result;
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
  C(id, 'switch', result);
  return caseValue;
}

// hook for variable declarations
function D(id: number, name: string, kind: VarKind, isSpread: boolean, value?: any): void {
  const init = arguments.length >= 5;
  D$.analysis.declare?.(id, name, kindToStr[kind], init, value, isSpread);
}

// hook for variable reads
function R(id: number, name: string, value: any): any {
  // general memoryAccess fires first
  const generalPost = D$.analysis.memoryAccess?.(id, value);
  if (generalPost) value = generalPost.result;
  // specific read fires second and wins
  const post = D$.analysis.read?.(id, name, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for variable writes
function W(id: number, names: string[], value: any): any {
  // general memoryWrite fires first
  const generalPost = D$.analysis.memoryWrite?.(id, value);
  if (generalPost) value = generalPost.result;
  // specific write fires second and wins
  const post = D$.analysis.write?.(id, names, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for literals
function L(id: number, value: any): any {
  // general fires first
  let post = D$.analysis.literal?.(id, value);
  if (post) {
    value = post.result;
  }
  // type-detect specific callback, fires second and wins
  let specificCb: keyof Analysis | undefined;
  if (typeof value === 'bigint') specificCb = 'bigintLiteral';
  else if (typeof value === 'boolean') specificCb = 'booleanLiteral';
  else if (value === null) specificCb = 'nullLiteral';
  else if (value instanceof RegExp) specificCb = 'regexpLiteral';
  else if (Array.isArray(value)) specificCb = 'arrayLiteral';
  else if (typeof value === 'function') specificCb = 'functionLiteral';
  else if (typeof value === 'string') specificCb = 'stringLiteral';
  else if (typeof value === 'number') specificCb = 'numberLiteral';
  else if (typeof value === 'object') specificCb = 'objectLiteral';
  if (specificCb) {
    const specificPost = (D$.analysis[specificCb] as any)?.(id, value);
    if (specificPost) value = specificPost.result;
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

// hook for yield expressions (value being sent out)
function Y(id: number, value: any, isDelegate: boolean): any {
  const post = D$.analysis._yield?.(id, value, isDelegate);
  if (post) value = post.result;
  return value;
}

// hook for yield resume (value received back from .next())
function Yr(id: number, received: any): any {
  const post = D$.analysis._resume?.(id, received);
  if (post) received = post.result;
  return received;
}

// hook for await expressions (value being awaited)
function Aw(id: number, value: any): any {
  const post = D$.analysis._await?.(id, value);
  if (post) value = post.result;
  return value;
}

// hook for await resume (resolved value)
function Awr(id: number, value: any): any {
  const post = D$.analysis._awaitResult?.(id, value);
  if (post) value = post.result;
  return value;
}

// hook for chain expression boundary — converts chainSkip sentinel back to undefined
function Ch(value: any): any {
  return value === chainSkip ? undefined : value;
}

// hook for uncaught exceptions
function X(id: number, exception: any): void {
  uncaughtException = { exception };
}

// hook for catch clause enter — always emitted, clears uncaughtException
// regardless of isEnabled.D so partial hooking cannot leave it stale
function Ce(): void {
  uncaughtException = undefined;
}

// hook for class field initialization
function Fi(id: number, obj: any, key: any, isStatic: boolean, value: any): any {
  const post = D$.analysis.fieldInit?.(id, obj, key, isStatic, value);
  if (post) value = post.result;
  return value;
}

// hook for super() constructor calls
// caller is (...args) => super(...args); returns function so args flow normally
function Su(id: number, caller: (...args: any[]) => any): any {
  return function() {
    let args: any[] = Array.from(arguments);
    const pre = D$.analysis.superCallPre?.(id, args);
    if (pre) args = pre.args;
    let result = caller(...args);
    const post = D$.analysis.superCall?.(id, args, result);
    if (post) result = post.result;
    return result;
  };
}

// helper to dispatch super method call hooks around an already-resolved function
function invokeSuperMethod(id: number, thisVal: any, prop: any, f: any, rawArgs: IArguments): any {
  let args: any[] = Array.from(rawArgs);
  const pre = D$.analysis.superMethodCallPre?.(id, thisVal, prop, args);
  if (pre) {
    prop = pre.prop;
    args = pre.args;
  }
  let result = Function.prototype.apply.call(f, thisVal, args);
  const post = D$.analysis.superMethodCall?.(id, thisVal, prop, args, result);
  if (post) result = post.result;
  return result;
}

// hook for super.method() / super[k]() calls
// getter is () => super.method (thunk); returns function so args flow normally
// memberOptional is always false for super (super?.method() is not valid syntax)
function Sm(
  id: number,
  thisVal: any,
  prop: any,
  _isConstructor: boolean,
  _memberOptional: boolean,
  callOptional: boolean,
  getter: () => any,
): any {
  let f = Gs(id, thisVal, prop, getter);
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip) return () => chainSkip;
  }
  return function() {
    return invokeSuperMethod(id, thisVal, prop, f, arguments);
  };
}

// hook for super.prop / super[k] reads
// getter is () => super.prop (thunk, ignores thisVal since super is lexical)
function Gs(
  id: number,
  thisVal: any,
  prop: any,
  getter: () => any,
): any {
  let value: any;
  const pre = D$.analysis.superGetFieldPre?.(id, thisVal, prop);
  if (pre) prop = pre.prop;
  value = getter();
  const post = D$.analysis.superGetField?.(id, thisVal, prop, value);
  if (post) value = post.result;
  return value;
}

// hook for super.prop = v / super[k] = v writes
// writer is (v) => super.prop = v
function Ps(
  id: number,
  thisVal: any,
  prop: any,
  value: any,
  writer: (v: any) => void,
): any {
  const pre = D$.analysis.superPutFieldPre?.(id, thisVal, prop, value);
  if (pre) {
    prop = pre.prop;
    value = pre.value;
  }
  writer(value);
  D$.analysis.superPutField?.(id, thisVal, prop, value);
  return value;
}

// get the location string from an id
function idToLoc(id: number): string {
  return locToStr(D$.ids[id]);
};

// hook for eval code instrumentation
function Ev(id: number, code: any, isDirect: boolean): any {
  if (typeof code !== 'string') return code;
  const pre = D$.analysis.instrumentCodePre?.(id, code, isDirect);
  if (pre) code = pre.code;
  const instCode = D$.instrument(code, isDirect ? 'eval' : 'evalIndirect');
  const post = D$.analysis.instrumentCode?.(id, instCode, isDirect);
  return post ? post.result : instCode;
}

// -----------------------------------------------------------------------------
// assign to the global D$ variable
// -----------------------------------------------------------------------------
const BASE = {
  analysis: {} as Analysis,
  ids: {} as Record<string, [number, number, number, number]>,
  idToLoc,
  utils,
  chainSkip,
  Ch,
  Se, Sx, F, M, Mp, TF, TM, TMp, Fe, Fx, Re, O, E, G, Gp, P, Pp, De,
  U, B, Up, C, Swl, Swr, D, R, W, L, Th, X, Y, Yr, Aw, Awr,
  Fi, Ce, Su, Sm, Gs, Ps, Ev
};
type GENERATED = {
  // on-the-fly instrumentation API
  instrument: (code: string, filename: string | undefined) => string;
}
type DynaJSType = typeof BASE & GENERATED & {
  stats?: unknown;
}

declare global { var D$: DynaJSType; };
export function setBaseObj(runtimeOpts : RuntimeOptions) {
  let counter = 0;

  const generated = {

    instrument: (code: string, filename: string | undefined) => {

      const instrumentOpt : StateOption = {
        ...runtimeOpts,
        isScript: false, // treat as module code for now - see issue #5
        callbackHint: undefined, // TODO mode,
        originalPath: filename,
        instrumentedPath: undefined, // TODO newPath,
      };

      return instrument(code, instrumentOpt);
    }
  }
  const dynaJSType = { ...BASE, ...generated } as DynaJSType;
  globalThis.D$ =  dynaJSType;
}
