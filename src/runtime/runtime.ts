import type { Analysis } from '../types/analysis.js';
import { CAPTURED, spec } from '../utils.js';

// -----------------------------------------------------------------------------
// runtime state shared by the hooks
// -----------------------------------------------------------------------------

// sentinel symbol for optional chain short-circuit propagation
export const chainSkip = Symbol('D$.chainSkip');

// stack to store return values
/** @dynajs-meta state balanced-stack */
export const returnStack: any[] = [];

// Mutable runtime state the hooks reassign. It lives behind a holder object so
// hooks.ts (a separate module) can mutate it across the import boundary — an
// imported `let` binding is read-only to the importer, but object fields are not.
export const rt: {
  uncaughtException: { exception: any } | undefined;
  lastComputedValue: any;
  switchLeft: any;
} = {
  /** @dynajs-meta state set-drain */
  uncaughtException: undefined,
  /** @dynajs-meta state scratch */
  lastComputedValue: undefined,
  /** @dynajs-meta state save-restore */
  switchLeft: undefined,
};

/** @dynajs-meta state balanced-stack */
const switchStack: any[] = [];
// Sentinels so the *native* `switch` branches on the value-aware `===` result
// (computed via B/C) rather than comparing lifted operands by proxy identity:
// Swl returns MATCH as the discriminant, each case returns MATCH iff its
// comparison held. Distinct per-statement matching is preserved (a switch only
// compares its own discriminant to its own case values).
export const SWITCH_MATCH = Symbol('switch-match');
export const SWITCH_NOMATCH = Symbol('switch-nomatch');
export function pushSwitchLeft() {
  switchStack.push(rt.switchLeft);
}
export function popSwitchLeft() {
  rt.switchLeft = switchStack.pop();
}

// -----------------------------------------------------------------------------
// eval-code instrumentation — the logic behind the Ev hook, factored out so
// invokeFunctionConstructor can reuse it directly (keeps this module free of any
// import back to hooks.ts; the Ev hook is just a thin delegator to this).
// -----------------------------------------------------------------------------
export function EvInternal(id: number, code: any, isDirect: boolean): any {
  const pre = D$.analysis.instrumentCodePre?.(id, code, isDirect);
  if (pre) {
    code = pre.code;
    if (pre.skip) return code;
  }
  const instCode =
    typeof code === 'string'
      ? D$.instrument(code, isDirect ? 'eval' : 'evalIndirect')
      : code;
  const post = D$.analysis.instrumentCode?.(id, instCode, isDirect);
  return post ? post.result : instCode;
}

// -----------------------------------------------------------------------------
// call dispatch helpers — shared machinery behind the F/M/TF/… hooks
// -----------------------------------------------------------------------------

// helper to invoke a tagged template call with hierarchical hooks (general-first, specific wins)
export function invokeTT(
  id: number,
  base: any,
  f: any,
  strings: any,
  values: any[],
  isMethod: boolean,
): any {
  let result: any;
  let skip = false;
  let args: any[] = [strings, ...values];
  let generalFrame: unknown;
  let specificFrame: unknown;

  // General hook fires first
  const generalPre = D$.analysis.invokeFunPre?.(
    id,
    f,
    base,
    args,
    false,
    isMethod,
  );
  if (generalPre) {
    f = generalPre.f;
    base = generalPre.base;
    args = generalPre.args;
    skip = generalPre.skip;
    generalFrame = generalPre.frame;
    strings = args[0];
    values = args.slice(1);
  }

  // Specific hook fires second and wins
  const specificPre = D$.analysis.taggedTemplatePre?.(
    id,
    f,
    base,
    strings,
    values,
    isMethod,
  );
  if (specificPre) {
    f = specificPre.f;
    base = specificPre.base;
    strings = specificPre.strings;
    values = specificPre.values;
    skip = specificPre.skip;
    specificFrame = specificPre.frame;
  }

  if (!skip) {
    result = Function.prototype.apply.call(f, base, [strings, ...values]);
  }

  args = [strings, ...values];

  // General post-hook fires first
  const generalPost = D$.analysis.invokeFun?.(
    id,
    f,
    base,
    args,
    result,
    false,
    isMethod,
    generalFrame,
  );
  if (generalPost) result = generalPost.result;

  // Specific post-hook fires second and wins
  const specificPost = D$.analysis.taggedTemplate?.(
    id,
    f,
    base,
    strings,
    values,
    result,
    isMethod,
    specificFrame,
  );
  if (specificPost) result = specificPost.result;

  return result;
}

// Instruments a `Function(...)`/`new Function(...)` call so that its body
// participates in the analysis. The last argument is treated as the function
// body and the preceding ones as parameter lists, matching the Function
// constructor semantics.
function invokeFunctionConstructor(id: number, f: any, args: any): any {
  const argArr: string[] = Array.prototype.slice
    .call(args)
    .map((v: any) => spec.ToString(v));
  // Invoke the original constructor first so that invalid params or body
  // throw exactly the error the user would normally see.
  f.apply(null, argArr);
  const paramList = argArr.slice(0, Math.max(argArr.length - 1, 0)).join(', ');
  const body = argArr.length > 0 ? argArr[argArr.length - 1] : '';
  const wrapped = `(function anonymous(${paramList}) {\n${body}\n})`;
  const processed = EvInternal(id, wrapped, false);
  if (typeof processed !== 'string') return processed;
  return CAPTURED.IndirectEval(processed);
}

// helper function to invoke a function
export function invokeFun(
  id: number,
  base: any,
  f: any,
  args: any,
  isConstructor: boolean,
  isMethod: boolean,
) {
  let result: any;
  let skip = false;
  let frame: unknown;
  const pre = D$.analysis.invokeFunPre?.(
    id,
    f,
    base,
    args,
    isConstructor,
    isMethod,
  );
  if (pre) {
    f = pre.f;
    base = pre.base;
    args = pre.args;
    skip = pre.skip;
    frame = pre.frame;
  }
  if (!skip) {
    if (f === CAPTURED.FunctionConstructor) {
      result = invokeFunctionConstructor(id, f, args);
    } else if (isConstructor) {
      result = construct(f, args);
    } else {
      result = CAPTURED.FunctionConstructor.prototype.apply.call(f, base, args);
    }
  }
  const post = D$.analysis.invokeFun?.(
    id,
    f,
    base,
    args,
    result,
    isConstructor,
    isMethod,
    frame,
  );
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
      case 0:
        return new f();
      case 1:
        return new f(args[0]);
      case 2:
        return new f(args[0], args[1]);
      case 3:
        return new f(args[0], args[1], args[2]);
      case 4:
        return new f(args[0], args[1], args[2], args[3]);
    }
    // for more than 4 arguments
    const argArray = Array.prototype.slice.call(args);
    const TempConstructor: any = function (this: any) {
      return f.apply(this, argArray);
    };
    TempConstructor.prototype = f.prototype;
    return new TempConstructor();
  }
}

// helper to dispatch super method call hooks around an already-resolved function
export function invokeSuperMethod(
  id: number,
  thisVal: any,
  prop: any,
  f: any,
  rawArgs: IArguments,
): any {
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

// -----------------------------------------------------------------------------
// operator dispatch — tables + specific-callback fan-out behind U/B/Up
// -----------------------------------------------------------------------------

export const UNARY_OPS: { [op: string]: (a: any) => any } = {
  '-': (a: any) => -a,
  '+': (a: any) => +a,
  '!': (a: any) => !a,
  '~': (a: any) => ~a,
  typeof: (a: any) => typeof a,
  void: (a: any) => void a,
};
export const BINARY_OPS: { [op: string]: (a: any, b: any) => any } = {
  '==': (a: any, b: any) => a == b,
  '!=': (a: any, b: any) => a != b,
  '===': (a: any, b: any) => a === b,
  '!==': (a: any, b: any) => a !== b,
  '<': (a: any, b: any) => a < b,
  '<=': (a: any, b: any) => a <= b,
  '>': (a: any, b: any) => a > b,
  '>=': (a: any, b: any) => a >= b,
  '<<': (a: any, b: any) => a << b,
  '>>': (a: any, b: any) => a >> b,
  '>>>': (a: any, b: any) => a >>> b,
  '+': (a: any, b: any) => a + b,
  '-': (a: any, b: any) => a - b,
  '*': (a: any, b: any) => a * b,
  '/': (a: any, b: any) => a / b,
  '%': (a: any, b: any) => a % b,
  '|': (a: any, b: any) => a | b,
  '^': (a: any, b: any) => a ^ b,
  '&': (a: any, b: any) => a & b,
  in: (a: any, b: any) => a in b,
  instanceof: (a: any, b: any) => a instanceof b,
  '**': (a: any, b: any) => a ** b,
};
const ARITHMETIC_BINARY_OPS = new Set(['+', '-', '*', '/', '%', '**']);
const COMPARISON_BINARY_OPS = new Set([
  '==',
  '!=',
  '===',
  '!==',
  '<',
  '<=',
  '>',
  '>=',
  'in',
  'instanceof',
]);
const BITWISE_BINARY_OPS = new Set(['&', '|', '^', '<<', '>>', '>>>']);
const ARITHMETIC_UNARY_OPS = new Set(['+', '-']);
const UPDATE_UNARY_OPS = new Set(['++', '--']);
export const CONDITION_CB: Record<string, keyof Analysis> = {
  if: 'ifCondition',
  while: 'whileCondition',
  'do-while': 'whileCondition',
  for: 'forCondition',
  '?': 'ternaryCondition',
  '&&': 'logicalAnd',
  '||': 'logicalOr',
  '??': 'nullishCoalescing',
  '?.': 'optionalChain',
  switch: 'switchCondition',
};

// helpers to fire specific binary pre/post callbacks based on op
export function fireSpecificBinaryPre(
  id: number,
  op: string,
  left: any,
  right: any,
):
  | { op: string; left: any; right: any; skip: boolean; frame?: unknown }
  | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_BINARY_OPS.has(op)) cb = 'arithmeticBinaryPre';
  else if (COMPARISON_BINARY_OPS.has(op)) cb = 'comparisonBinaryPre';
  else if (BITWISE_BINARY_OPS.has(op)) cb = 'bitwiseBinaryPre';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, left, right);
}
export function fireSpecificBinary(
  id: number,
  op: string,
  left: any,
  right: any,
  value: any,
  frame?: unknown,
): { result: any } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_BINARY_OPS.has(op)) cb = 'arithmeticBinary';
  else if (COMPARISON_BINARY_OPS.has(op)) cb = 'comparisonBinary';
  else if (BITWISE_BINARY_OPS.has(op)) cb = 'bitwiseBinary';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, left, right, value, frame);
}
// helpers to fire specific unary pre/post callbacks based on op
export function fireSpecificUnaryPre(
  id: number,
  op: string,
  prefix: boolean,
  operand: any,
): { op: string; operand: any; skip: boolean; frame?: unknown } | undefined {
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
export function fireSpecificUnary(
  id: number,
  op: string,
  prefix: boolean,
  operand: any,
  value: any,
  frame?: unknown,
): { result: any } | undefined {
  let cb: keyof Analysis | undefined;
  if (ARITHMETIC_UNARY_OPS.has(op)) cb = 'arithmeticUnary';
  else if (op === '!') cb = 'logicalUnary';
  else if (op === '~') cb = 'bitwiseUnary';
  else if (op === 'typeof') cb = 'typeofUnary';
  else if (op === 'void') cb = 'voidUnary';
  else if (UPDATE_UNARY_OPS.has(op)) cb = 'updateUnary';
  if (!cb) return undefined;
  return (D$.analysis[cb] as any)?.(id, op, prefix, operand, value, frame);
}

// -----------------------------------------------------------------------------
// template literal concatenation step behind the TL hook
// -----------------------------------------------------------------------------

export function templateConcatStep(id: number, left: any, right: any): any {
  let skip = false;
  let frame: unknown;
  const pre = D$.analysis.templateConcatPre?.(id, left, right);
  if (pre) {
    left = pre.left;
    right = pre.right;
    skip = pre.skip;
    frame = pre.frame;
  }
  let result: any;
  if (!skip) {
    result = left + spec.ToString(right);
  }
  const post = D$.analysis.templateConcat?.(id, left, right, result, frame);
  if (post) result = post.result;
  return result;
}
