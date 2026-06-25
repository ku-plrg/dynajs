declare const WrappedValueBrand: unique symbol;

type WrapBrand<B extends boolean> = { readonly [WrappedValueBrand]: B };

export type Wrapped<T = unknown> = T & WrapBrand<true>;

export type Unwrapped<T = unknown> = T & WrapBrand<false>;

/** Primitives <: Unwrapped, but not vice versa (e.g. it can be an object that has been unwrapped) */
export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

interface SpecOps
  extends
    StringOps,
    ArithmeticOps,
    BitwiseOps,
    CompareOps,
    MathOps,
    ListOps,
    RangeOps,
    RegexOps {
  /** an injection (`unwrapped -> wrapped`). inverse of `$.peek`. default information transformation */
  base: <T extends Unwrapped | Primitive>(
    v: T,
    parent: Wrapped[],
  ) => Wrapped<T>;
  /** a projection (`wrapped -> unwrapped`). inverse of `$.base`. lost of information happens due to concretization */
  peek: <T>(wrapped: Wrapped<T>) => Unwrapped<T>;
  /** a field read (`base[prop]`) routed through the analysis's `getFieldInfo`, so a
   *  spec model observes element/property reads exactly as user code `o[p]` does
   *  (e.g. concolic's symbolic-array `select`). Without it a model read concretizes
   *  via `base`. Falls back to `baseInfo` when no `getFieldInfo` applies. */
  get: (base: Wrapped<unknown>, prop: Wrapped<unknown>) => Wrapped<unknown>;
  /** Invoke `f` (a callable) with receiver `thisArg` and `args`, routing to `f`'s */
  apply: (
    f: Wrapped<unknown>,
    thisArg: Wrapped<unknown>,
    args: Wrapped<unknown>[],
  ) => Wrapped<unknown>;
  /** a projection to use Wrapped value as a condition */
  condition: (bid: number, cond: Wrapped<boolean>) => boolean;
}

interface StringOps {
  substring: (
    s: Wrapped<string>,
    start: Wrapped<number>,
    end: Wrapped<number>,
  ) => Wrapped<string>;
  concatenate: (s1: Wrapped<string>, s2: Wrapped<string>) => Wrapped<string>;
  length: (s: Wrapped<string>) => Wrapped<number>;
  codeUnitAt: (s: Wrapped<string>, i: Wrapped<number>) => Wrapped<string>;
  trim: (
    s: Wrapped<string>,
    leading: boolean,
    trailing: boolean,
  ) => Wrapped<string>;
  toLower: (s: Wrapped<string>) => Wrapped<string>;
  toUpper: (s: Wrapped<string>) => Wrapped<string>;
}

export interface RegexMatch {
  matched: Wrapped<boolean>; // did the subject match (str.in_re)
  index: Wrapped<number>; // the match's start index
  captures: Wrapped<string>[]; // [0] = whole match, [i] = capture group i
  input: Wrapped<string>; // the subject string
}

interface RegexOps {
  /* abstraction over RegexExec */
  regexExec: (regex: Wrapped<unknown>, string: Wrapped<string>) => RegexMatch;
}

interface ArithmeticOps {
  add: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  subtract: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  multiply: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  divide: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  remainder: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  negate: (x: Wrapped<number>) => Wrapped<number>;
  exponentiate: (b: Wrapped<number>, e: Wrapped<number>) => Wrapped<number>;
}

interface BitwiseOps {
  bitwiseAND: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  bitwiseOR: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  bitwiseXOR: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
}

interface CompareOps {
  lessThan: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  lessThanEqual: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  greaterThan: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  greaterThanEqual: (
    l: Wrapped<number>,
    r: Wrapped<number>,
  ) => Wrapped<boolean>;
  is: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(
    l: L,
    r: R,
  ) => Wrapped<boolean /* l is Extract<L, R> */>;
  isNot: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(
    l: L,
    r: R,
  ) => Wrapped<boolean /* l is Exclude<L, R> */>;
  isNaN: (x: Wrapped<number>) => Wrapped<boolean>;
  isFinite: (x: Wrapped<number>) => Wrapped<boolean>;
  isInteger: (x: Wrapped<number>) => Wrapped<boolean>;
  isType: (
    x: Wrapped<unknown>,
    ty:
      | 'object'
      | 'null'
      | 'undefined'
      | 'string'
      | 'number'
      | 'boolean'
      | 'symbol'
      | 'bigint',
  ) => Wrapped<boolean>;
}

interface MathOps {
  min: (...xs: Wrapped<number>[]) => Wrapped<number>;
  max: (...xs: Wrapped<number>[]) => Wrapped<number>;
  abs: (x: Wrapped<number>) => Wrapped<number>;
  floor: (x: Wrapped<number>) => Wrapped<number>;
  ceil: (x: Wrapped<number>) => Wrapped<number>;
  round: (x: Wrapped<number>) => Wrapped<number>;
  truncate: (x: Wrapped<number>) => Wrapped<number>;
  clamp: (
    x: Wrapped<number>,
    lower: Wrapped<number>,
    upper: Wrapped<number>,
  ) => Wrapped<number>;
}

interface ListOps {
  append: <T>(list: T[], x: T) => T[];
  prepend: <T>(list: T[], x: T) => T[];
  contains: <T>(list: T[], x: T) => boolean;
}

interface RangeOps {
  range: (
    lo: Wrapped<number>,
    loInclusive: boolean,
    hi: Wrapped<number>,
    hiInclusive: boolean,
    ascending: boolean,
    bid: number,
  ) => Wrapped<number>[];
}

export interface SpecRuntime extends SpecOps {
  // constant
  undef: Wrapped<undefined>;
  lit: <T extends Unwrapped | Primitive>(v: T) => Wrapped<T>;
}
