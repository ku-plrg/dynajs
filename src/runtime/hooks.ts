import {
  BINARY_OPS,
  CONDITION_CB,
  chainSkip,
  EvInternal,
  fireSpecificBinary,
  fireSpecificBinaryPre,
  fireSpecificUnary,
  fireSpecificUnaryPre,
  invokeFun,
  invokeSuperMethod,
  invokeTT,
  popSwitchLeft,
  pushSwitchLeft,
  returnStack,
  rt,
  SWITCH_MATCH,
  SWITCH_NOMATCH,
  templateConcatStep,
  UNARY_OPS,
} from './runtime.js';
import type { AnalysisCallback } from '../types/analysis.js';
import { err, kindToStr, type VarKind } from '../utils.js';

// -----------------------------------------------------------------------------
// hooks for dynamic analysis — the functions the instrumented code calls as
// `D$.<name>(...)`. The shared machinery they lean on lives in hooks-internal.ts.
// -----------------------------------------------------------------------------

// hook for script enter
export function Se(
  id: number,
  instrumentedPath: string,
  originalPath: string,
): void {
  rt.lastComputedValue = undefined;
  D$.analysis.scriptEnter?.(id, instrumentedPath, originalPath);
}

// Sets and returns the last computed expression-statement value.
export function Lcs(value: any): any {
  rt.lastComputedValue = value;
  return value;
}

// Returns the last computed expression-statement value.
export function Lcv(): any {
  return rt.lastComputedValue;
}

// hook for script exit
export function Sx(id: number): void {
  const exc = rt.uncaughtException;
  D$.analysis.scriptExit?.(id, exc);
  if (exc) {
    const { exception } = exc;
    rt.uncaughtException = undefined;
    throw exception;
  }
}

// hook for function calls
export function F(
  id: number,
  f: any,
  isConstructor: boolean,
  callOptional: boolean,
): any {
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip)
      return () => chainSkip;
  }
  return function (this: any) {
    return invokeFun(id, this, f, arguments, isConstructor, false);
  };
}

// hook for method calls
export function M(
  id: number,
  base: any,
  prop: any,
  isConstructor: boolean,
  memberOptional: boolean,
  callOptional: boolean,
): any {
  if (base === chainSkip) return () => chainSkip;
  if (memberOptional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return () => chainSkip;
  }
  let f = G(id, base, prop, false);
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip)
      return () => chainSkip;
  }
  return function () {
    return invokeFun(id, base, f, arguments, isConstructor, true);
  };
}

export function Mp(
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
  let f = Gp(id, base, prop, getter, false);
  if (f === chainSkip) return () => chainSkip;
  if (callOptional) {
    f = C(id, '?.', f);
    if (f === null || f === undefined || f === chainSkip)
      return () => chainSkip;
  }
  return function () {
    return invokeFun(id, base, f, arguments, isConstructor, true);
  };
}

// hook for tagged template function calls
export function TF(id: number, f: any): any {
  return function (this: any, strings: any, ...values: any[]) {
    return invokeTT(id, this, f, strings, values, false);
  };
}

// hook for tagged template method calls
export function TM(id: number, base: any, prop: any): any {
  const f = G(id, base, prop, false);
  return (strings: any, ...values: any[]) =>
    invokeTT(id, base, f, strings, values, true);
}

export function TMp(
  id: number,
  base: any,
  prop: any,
  getter: (base: any) => any,
): any {
  const f = Gp(id, base, prop, getter, false);
  return (strings: any, ...values: any[]) =>
    invokeTT(id, base, f, strings, values, true);
}

// hook for function enter
export function Fe(
  id: number,
  f: any,
  base: any,
  args: any,
  isAsync: boolean,
  isGenerator: boolean,
): void {
  returnStack.push(undefined);
  pushSwitchLeft();
  D$.analysis.functionEnter?.(id, f, base, args, isAsync, isGenerator);
}

// hook for function exit
export function Fx(id: number, isAsync: boolean, isGenerator: boolean): void {
  const exc = rt.uncaughtException;
  const ret = returnStack.pop();
  popSwitchLeft();
  D$.analysis.functionExit?.(id, ret, exc, isAsync, isGenerator);
  if (exc) {
    const { exception } = exc;
    rt.uncaughtException = undefined;
    throw exception;
  }
}

// hook for return statements
export function Re(id: number, value: any): any {
  const post = D$.analysis._return?.(id, value);
  if (post) {
    value = post.result;
  }
  returnStack[returnStack.length - 1] = value;
  return value;
}

// hook for RHS object of for-in/of loops
export function O(id: number, value: any, isForIn: boolean): any {
  const post = D$.analysis.forInOfObject?.(id, value, isForIn);
  if (post) value = post.result;
  return value;
}

// hook for the end of an expression
export function E(id: number, value: any): any {
  D$.analysis.endExpression?.(id, value);
  return value;
}

// hook for spread elements (`...value` in array literals, call arguments, and
// object literals). Fires before the value is spread natively, so the
// (possibly replaced) return value is what gets iterated/copied.
export function Sp(id: number, value: any): any {
  const post = D$.analysis.spread?.(id, value);
  if (post) value = post.result;
  return value;
}

// hook for property reads (get-field)
export function G(
  id: number,
  base: any,
  prop: any,
  optional: boolean,
): any {
  if (base === chainSkip) return chainSkip;
  if (optional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return chainSkip;
  }
  let skip = false;
  let value;
  let frame: unknown;
  const pre = D$.analysis.getFieldPre?.(id, base, prop, false);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
    frame = pre.frame;
  }
  if (!skip) {
    value = base[prop];
  }
  // general memoryAccess fires first
  const generalPost = D$.analysis.memoryAccess?.(id, value);
  if (generalPost) value = generalPost.result;
  // specific getField fires second and wins
  const post = D$.analysis.getField?.(id, base, prop, value, false, frame);
  if (post) {
    value = post.result;
  }
  return value;
}

export function Gp(
  id: number,
  base: any,
  prop: any,
  getter: (base: any) => any,
  optional: boolean,
): any {
  if (base === chainSkip) return chainSkip;
  if (optional) {
    base = C(id, '?.', base);
    if (base === null || base === undefined) return chainSkip;
  }
  let skip = false;
  let value;
  let frame: unknown;
  const pre = D$.analysis.getFieldPre?.(id, base, prop, true);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    skip = pre.skip;
    frame = pre.frame;
  }
  if (!skip) {
    value = getter(base);
  }
  const generalPost = D$.analysis.memoryAccess?.(id, value);
  if (generalPost) value = generalPost.result;
  const post = D$.analysis.getField?.(id, base, prop, value, true, frame);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for property writes (set-field)
export function P(
  id: number,
  base: any,
  prop: any,
  value: any,
  strict: boolean,
): any {
  let skip = false;
  let frame: unknown;
  const pre = D$.analysis.putFieldPre?.(id, base, prop, value, false);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    value = pre.value;
    skip = pre.skip;
    frame = pre.frame;
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
  const post = D$.analysis.putField?.(id, base, prop, value, false, frame);
  if (post) {
    value = post.result;
  }
  return value;
}

export function Pp(
  id: number,
  base: any,
  prop: any,
  value: any,
  writer: (base: any, value: any) => any,
): any {
  let skip = false;
  let frame: unknown;
  const pre = D$.analysis.putFieldPre?.(id, base, prop, value, true);
  if (pre) {
    base = pre.base;
    prop = pre.prop;
    value = pre.value;
    skip = pre.skip;
    frame = pre.frame;
  }
  if (!skip) {
    writer(base, value);
  }
  const generalPost = D$.analysis.memoryWrite?.(id, value);
  if (generalPost) value = generalPost.result;
  const post = D$.analysis.putField?.(id, base, prop, value, true, frame);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for delete operations
export function De(
  id: number,
  base: any,
  prop: any,
  optional: boolean,
): any {
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
export function U(id: number, op: string, operand: any): any {
  let value;
  let skip = false;
  let frame: unknown;
  let specificFrame: unknown;
  // general pre fires first
  const pre = D$.analysis.unaryPre?.(id, op, true, operand);
  if (pre) {
    op = pre.op;
    operand = pre.operand;
    skip = pre.skip;
    frame = pre.frame;
  }
  // specific pre fires second and wins
  const specificPre = fireSpecificUnaryPre(id, op, true, operand);
  if (specificPre) {
    op = specificPre.op;
    operand = specificPre.operand;
    skip = specificPre.skip;
    specificFrame = specificPre.frame;
  }
  const f = UNARY_OPS[op];
  if (!f) {
    err(`unknown unary operator ${op}`);
  }
  if (!skip) {
    value = f(operand);
  }
  // general post fires first
  const post = D$.analysis.unary?.(id, op, true, operand, value, frame);
  if (post) {
    value = post.result;
  }
  // specific post fires second and wins
  const specificPost = fireSpecificUnary(
    id,
    op,
    true,
    operand,
    value,
    specificFrame,
  );
  if (specificPost) {
    value = specificPost.result;
  }
  return value;
}

// hook for binary operations
export function B(id: number, op: string, left: any, right: any): any {
  let value;
  let skip = false;
  let frame: unknown;
  let specificFrame: unknown;
  // general pre fires first
  const pre = D$.analysis.binaryPre?.(id, op, left, right);
  if (pre) {
    op = pre.op;
    left = pre.left;
    right = pre.right;
    skip = pre.skip;
    frame = pre.frame;
  }
  // specific pre fires second and wins
  const specificPre = fireSpecificBinaryPre(id, op, left, right);
  if (specificPre) {
    op = specificPre.op;
    left = specificPre.left;
    right = specificPre.right;
    skip = specificPre.skip;
    specificFrame = specificPre.frame;
  }
  const f = BINARY_OPS[op];
  if (!f) {
    err(`unknown binary operator ${op}`);
  }
  if (!skip) {
    value = f(left, right);
  }
  // general post fires first
  const post = D$.analysis.binary?.(id, op, left, right, value, frame);
  if (post) value = post.result;
  // specific post fires second and wins
  const specificPost = fireSpecificBinary(
    id,
    op,
    left,
    right,
    value,
    specificFrame,
  );
  if (specificPost) value = specificPost.result;
  return value;
}

export function Up(
  id: number,
  binaryId: number,
  op: string,
  prefix: boolean,
  argument: any,
  write: (x: any) => any,
): any {
  let operand = argument;
  let unaryFrame: unknown;
  let specificUnaryFrame: unknown;
  // general pre fires first
  const unaryPre = D$.analysis.unaryPre?.(id, op, prefix, operand);
  if (unaryPre) {
    operand = unaryPre.operand;
    unaryFrame = unaryPre.frame;
  }
  // specific pre fires second and wins
  const specificUnaryPre = fireSpecificUnaryPre(id, op, prefix, operand);
  if (specificUnaryPre) {
    operand = specificUnaryPre.operand;
    specificUnaryFrame = specificUnaryPre.frame;
  }
  const oldValue = -(-operand);
  const binaryOp = op === '++' ? '+' : '-';
  let left: any = oldValue;
  let right: any = typeof oldValue == 'bigint' ? 1n : 1;
  let skip = false;
  let binaryFrame: unknown;
  let specificBinaryFrame: unknown;
  const binaryPre = D$.analysis.binaryPre?.(binaryId, binaryOp, left, right);
  if (binaryPre) {
    left = binaryPre.left;
    right = binaryPre.right;
    skip = binaryPre.skip;
    binaryFrame = binaryPre.frame;
  }
  const specificBinaryPre = fireSpecificBinaryPre(
    binaryId,
    binaryOp,
    left,
    right,
  );
  if (specificBinaryPre) {
    left = specificBinaryPre.left;
    right = specificBinaryPre.right;
    skip = specificBinaryPre.skip;
    specificBinaryFrame = specificBinaryPre.frame;
  }
  let newValue;
  if (!skip) {
    newValue = op === '++' ? left + right : left - right;
  }
  const binaryPost = D$.analysis.binary?.(
    binaryId,
    binaryOp,
    left,
    right,
    newValue,
    binaryFrame,
  );
  if (binaryPost) newValue = binaryPost.result;
  const specificBinaryPost = fireSpecificBinary(
    binaryId,
    binaryOp,
    left,
    right,
    newValue,
    specificBinaryFrame,
  );
  if (specificBinaryPost) newValue = specificBinaryPost.result;
  write(newValue);
  let result = prefix ? newValue : oldValue;
  const unaryPost = D$.analysis.unary?.(
    id,
    op,
    prefix,
    operand,
    result,
    unaryFrame,
  );
  if (unaryPost) result = unaryPost.result;
  const specificUnaryPost = fireSpecificUnary(
    id,
    op,
    prefix,
    operand,
    result,
    specificUnaryFrame,
  );
  if (specificUnaryPost) result = specificUnaryPost.result;
  return result;
}

// hook for condition expressions
export function C(id: number, op: string, value: any): any {
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

// hook for a class heritage (`class … extends E`): native class machinery needs
// a raw constructor or null, so unlift E — a lifted primitive (e.g. `null`) would
// otherwise be rejected as "not a constructor or null". A real (object) heritage
// unlifts to itself, so non-primitive `extends` is unaffected.
export function Hc(id: number, value: any): any {
  const post = D$.analysis.classHeritage?.(id, value);
  return post ? post.result : value;
}

// hook for left side of a switch statement
export function Swl(id: number, value: any): any {
  rt.switchLeft = value;
  return SWITCH_MATCH;
}

// hook for right side of a switch case
export function Swr(id: number, caseValue: any): any {
  const matches = C(id, 'switch', B(id, '===', rt.switchLeft, caseValue));
  return matches ? SWITCH_MATCH : SWITCH_NOMATCH;
}

// hook for variable declarations
export function D(
  id: number,
  name: string,
  kind: VarKind,
  isSpread: boolean,
  init: boolean,
  value: any,
): void {
  D$.analysis.declare?.(id, name, kindToStr[kind], init, value, isSpread);
}

// hook for variable reads
export function R(id: number, name: string, value: any): any {
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
export function W(id: number, names: string[], value: any): any {
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
export function L(id: number, value: any): any {
  // general fires first
  const post = D$.analysis.literal?.(id, value);
  if (post) {
    value = post.result;
  }
  // type-detect specific callback, fires second and wins
  let specificCb: keyof AnalysisCallback | undefined;
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

// hook for template literal chain — each step fires templateConcat twice
// (base + expr, then intermediate + quasi) so the binary-pair hook can be
// reused outside of templates.
export function TL(id: number, base: any, expr: any, quasi: string): any {
  const intermediate = templateConcatStep(id, base, expr);
  return templateConcatStep(id, intermediate, quasi);
}

// hook for throw statements
export function Th(id: number, value: any): any {
  const post = D$.analysis._throw?.(id, value);
  if (post) {
    value = post.result;
  }
  return value;
}

// hook for yield expressions (value being sent out)
export function Y(id: number, value: any, isDelegate: boolean): any {
  const post = D$.analysis._yield?.(id, value, isDelegate);
  if (post) value = post.result;
  return value;
}

// hook for yield resume (value received back from .next())
export function Yr(id: number, received: any): any {
  const post = D$.analysis._resume?.(id, received);
  if (post) received = post.result;
  return received;
}

// hook for await expressions (value being awaited)
export function Aw(id: number, value: any): any {
  const post = D$.analysis._await?.(id, value);
  if (post) value = post.result;
  return value;
}

// hook for await resume (resolved value)
export function Awr(id: number, value: any): any {
  const post = D$.analysis._awaitResult?.(id, value);
  if (post) value = post.result;
  return value;
}

// hook for chain expression boundary — converts chainSkip sentinel back to undefined
export function Ch(value: any): any {
  return value === chainSkip ? undefined : value;
}

// hook for uncaught exceptions
export function X(id: number, exception: any): void {
  rt.uncaughtException = { exception };
}

// hook for catch clause enter — always emitted, clears uncaughtException
// regardless of isEnabled.D so partial hooking cannot leave it stale
export function Ce(): void {
  rt.uncaughtException = undefined;
}

// hook for class field initialization
export function Fi(
  id: number,
  obj: any,
  key: any,
  isStatic: boolean,
  value: any,
): any {
  const post = D$.analysis.fieldInit?.(id, obj, key, isStatic, value);
  if (post) value = post.result;
  return value;
}

// hook for super() constructor calls
// caller is (...args) => super(...args); returns function so args flow normally
export function Su(id: number, caller: (...args: any[]) => any): any {
  return function () {
    let args: any[] = Array.from(arguments);
    const pre = D$.analysis.superCallPre?.(id, args);
    if (pre) args = pre.args;
    let result = caller(...args);
    const post = D$.analysis.superCall?.(id, args, result);
    if (post) result = post.result;
    return result;
  };
}

// hook for super.method() / super[k]() calls
// getter is () => super.method (thunk); returns function so args flow normally
// memberOptional is always false for super (super?.method() is not valid syntax)
export function Sm(
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
    if (f === null || f === undefined || f === chainSkip)
      return () => chainSkip;
  }
  return function () {
    return invokeSuperMethod(id, thisVal, prop, f, arguments);
  };
}

// hook for super.prop / super[k] reads
// getter is () => super.prop (thunk, ignores thisVal since super is lexical)
export function Gs(
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
export function Ps(
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

// hook for eval code instrumentation — delegates to the shared EvInternal so
// invokeFunctionConstructor can reuse the same logic without importing hooks.ts
export function Ev(id: number, code: any, isDirect: boolean): any {
  return EvInternal(id, code, isDirect);
}
