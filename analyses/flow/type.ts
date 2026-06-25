declare const WrappedValueBrand: unique symbol;

type WrapBrand<B extends boolean> = { readonly [WrappedValueBrand]: B };

export type Lifted<T = unknown> = T & WrapBrand<true>;

export type Unlifted<T = unknown> = T & WrapBrand<false>;

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
  base: <T extends Unlifted | Primitive>(
    v: T,
    parent: Lifted[],
  ) => Lifted<T>;
  /** a projection (`wrapped -> unwrapped`). inverse of `$.base`. lost of information happens due to concretization */
  peek: <T>(wrapped: Lifted<T>) => Unlifted<T>;
  /** a field read (`base[prop]`) routed through the analysis's `getFieldInfo`, so a
   *  spec model observes element/property reads exactly as user code `o[p]` does
   *  (e.g. concolic's symbolic-array `select`). Without it a model read concretizes
   *  via `base`. Falls back to `baseInfo` when no `getFieldInfo` applies. */
  get: (base: Lifted<unknown>, prop: Lifted<unknown>) => Lifted<unknown>;
  /** Invoke `f` (a callable) with receiver `thisArg` and `args`, routing to `f`'s */
  apply: (
    f: Lifted<unknown>,
    thisArg: Lifted<unknown>,
    args: Lifted<unknown>[],
  ) => Lifted<unknown>;
  /** a projection to use Wrapped value as a condition */
  condition: (bid: number, cond: Lifted<boolean>) => boolean;
}

interface StringOps {
  substring: (
    s: Lifted<string>,
    start: Lifted<number>,
    end: Lifted<number>,
  ) => Lifted<string>;
  concatenate: (s1: Lifted<string>, s2: Lifted<string>) => Lifted<string>;
  length: (s: Lifted<string>) => Lifted<number>;
  codeUnitAt: (s: Lifted<string>, i: Lifted<number>) => Lifted<string>;
  trim: (
    s: Lifted<string>,
    leading: boolean,
    trailing: boolean,
  ) => Lifted<string>;
  toLower: (s: Lifted<string>) => Lifted<string>;
  toUpper: (s: Lifted<string>) => Lifted<string>;
}

export interface RegexMatch {
  matched: Lifted<boolean>; // did the subject match (str.in_re)
  index: Lifted<number>; // the match's start index
  captures: Lifted<string>[]; // [0] = whole match, [i] = capture group i
  input: Lifted<string>; // the subject string
}

interface RegexOps {
  /* abstraction over RegexExec */
  regexExec: (regex: Lifted<unknown>, string: Lifted<string>) => RegexMatch;
}

interface ArithmeticOps {
  add: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  subtract: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  multiply: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  divide: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  remainder: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  negate: (x: Lifted<number>) => Lifted<number>;
  exponentiate: (b: Lifted<number>, e: Lifted<number>) => Lifted<number>;
}

interface BitwiseOps {
  bitwiseAND: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  bitwiseOR: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
  bitwiseXOR: (l: Lifted<number>, r: Lifted<number>) => Lifted<number>;
}

interface CompareOps {
  lessThan: (l: Lifted<number>, r: Lifted<number>) => Lifted<boolean>;
  lessThanEqual: (l: Lifted<number>, r: Lifted<number>) => Lifted<boolean>;
  greaterThan: (l: Lifted<number>, r: Lifted<number>) => Lifted<boolean>;
  greaterThanEqual: (
    l: Lifted<number>,
    r: Lifted<number>,
  ) => Lifted<boolean>;
  is: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
    l: L,
    r: R,
  ) => Lifted<boolean /* l is Extract<L, R> */>;
  isNot: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
    l: L,
    r: R,
  ) => Lifted<boolean /* l is Exclude<L, R> */>;
  isNaN: (x: Lifted<number>) => Lifted<boolean>;
  isFinite: (x: Lifted<number>) => Lifted<boolean>;
  isInteger: (x: Lifted<number>) => Lifted<boolean>;
  isType: (
    x: Lifted<unknown>,
    ty:
      | 'object'
      | 'null'
      | 'undefined'
      | 'string'
      | 'number'
      | 'boolean'
      | 'symbol'
      | 'bigint',
  ) => Lifted<boolean>;
}

interface MathOps {
  min: (...xs: Lifted<number>[]) => Lifted<number>;
  max: (...xs: Lifted<number>[]) => Lifted<number>;
  abs: (x: Lifted<number>) => Lifted<number>;
  floor: (x: Lifted<number>) => Lifted<number>;
  ceil: (x: Lifted<number>) => Lifted<number>;
  round: (x: Lifted<number>) => Lifted<number>;
  truncate: (x: Lifted<number>) => Lifted<number>;
  clamp: (
    x: Lifted<number>,
    lower: Lifted<number>,
    upper: Lifted<number>,
  ) => Lifted<number>;
}

interface ListOps {
  append: <T>(list: T[], x: T) => T[];
  prepend: <T>(list: T[], x: T) => T[];
  contains: <T>(list: T[], x: T) => boolean;
}

interface RangeOps {
  range: (
    lo: Lifted<number>,
    loInclusive: boolean,
    hi: Lifted<number>,
    hiInclusive: boolean,
    ascending: boolean,
    bid: number,
  ) => Lifted<number>[];
}

export interface SpecRuntime extends SpecOps {
  // constant
  undef: Lifted<undefined>;
  lit: <T extends Unlifted | Primitive>(v: T) => Lifted<T>;
}
