declare const LiftedValueBrand: unique symbol;

type LiftBrand<B extends boolean> = { readonly [LiftedValueBrand]: B };

export type Lifted<T = unknown> = T & LiftBrand<true>;

export type Unlifted<T = unknown> = T & LiftBrand<false>;


export type ValuedGeneral<Shape extends {}, Value = unknown> = Shape & {
  value: Value;
};

export type Valued<Info, Value = unknown> = ValuedGeneral<
  { info: Info | undefined },
  Value
>;

/** Primitives <: Unlifted, but not vice versa (e.g. it can be an object that has been unlifted) */
export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export interface SpecRuntime extends SpecOps {}

interface SpecOps
  extends
    CondOps,
    ObjectOps,
    StringOps,
    ArithmeticOps,
    BitwiseOps,
    CompareOps,
    MathOps,
    ListOps,
    RangeOps,
    RegexOps {
  /** an injection (`unlifted -> lifted`). inverse of `$.value`. default information transformation */
  default: <T extends Unlifted | Primitive>(
    v: T,
    parent: Lifted[],
  ) => Lifted<T>;
  /** a projection (`lifted -> unlifted`). inverse of `$.base`. lost of information happens due to concretization */
  value: <T>(lifted: Lifted<T>) => Unlifted<T>;
  /** a projection (`lifted -> info`). exists conceptually, but is not used in practice */
  info: <T extends Unlifted | Primitive>(lifted: Lifted<T>) => unknown;
}

interface CondOps {
  /* ... */
  condition: (bid: number, cond: Lifted<boolean>) => Lifted<boolean>;
}

interface ObjectOps {
  /** .[[Get]] */
  get: (base: Lifted<unknown>, prop: Lifted<unknown>) => Lifted<unknown>;
  /** .[[Set]] */
  // set :

  /** [[Call]] */
  apply: (
    f: Lifted<unknown>,
    thisArg: Lifted<unknown>,
    args: Lifted<unknown>[],
  ) => Lifted<unknown>;
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
  greaterThanEqual: (l: Lifted<number>, r: Lifted<number>) => Lifted<boolean>;
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
