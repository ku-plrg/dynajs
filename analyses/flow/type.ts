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
    DynamicOps,
    ObjectOps,
    StringOps,
    ArithmeticOps,
    BitwiseOps,
    CompareOps,
    MathOps,
    ListOps,
    RangeOps {
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

interface DynamicOps {
  contains: <T>(seq: T[] | Lifted<string>, x: T) => Lifted<boolean>;
}

interface ObjectOps {
  /** .[[Get]] */
  get: (base: Lifted<unknown>, prop: Lifted<unknown>) => Lifted<unknown>;
  /** .[[Set]] — native write on the receiver + a setFieldInfo notification so an
   * analysis can model the write (e.g. a symbolic array's length/elements). Returns V. */
  set: (
    base: Lifted<unknown>,
    prop: Lifted<unknown>,
    value: Lifted<unknown>,
  ) => Lifted<unknown>;

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
  /** only exists for String.prototype.replaceAll - worth it? */
  containsStr: (s: Lifted<string>, sub: Lifted<string>) => Lifted<boolean>;
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
  lessThan(l: Lifted<number>, r: Lifted<number>): Lifted<boolean>;
  lessThan(l: Lifted<bigint>, r: Lifted<bigint>): Lifted<boolean>;
  lessThanEqual(l: Lifted<number>, r: Lifted<number>): Lifted<boolean>;
  lessThanEqual(l: Lifted<bigint>, r: Lifted<bigint>): Lifted<boolean>;
  greaterThan(l: Lifted<number>, r: Lifted<number>): Lifted<boolean>;
  greaterThan(l: Lifted<bigint>, r: Lifted<bigint>): Lifted<boolean>;
  greaterThanEqual(l: Lifted<number>, r: Lifted<number>): Lifted<boolean>;
  greaterThanEqual(l: Lifted<bigint>, r: Lifted<bigint>): Lifted<boolean>;
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
  /** List membership over a native array of (identity-)lifted elements, compared as-is. */
  containsList: <T>(list: T[], x: T) => Lifted<boolean>;
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
