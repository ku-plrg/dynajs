declare const WrappedValueBrand: unique symbol;

export type Wrapped<T = unknown> = T & { readonly [WrappedValueBrand]: true; };

export type Unwrapped<T = unknown> = T & { readonly [WrappedValueBrand]: false; };

// Primitives are (implicit) subtype of unwrapped, but unwrapped is not necessarily primitive (e.g. it can be an object that has been unwrapped)
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Entry<Info> = { value: unknown; info: Info };

export interface SpecOps extends StringOps {
  // default propagation: unwrapped -> wrapped
  base: <T extends Unwrapped | Primitive>(v: T, parent: Wrapped[]) => Wrapped<T>;
  // wrapped -> unwrapped
  peek: <T>(wrapped: Wrapped<T>) => Unwrapped<T>;
}

interface StringOps {
  substring: (s: Wrapped<string>, start: Wrapped<number>, end: Wrapped<number>) => Wrapped<string>;
  concatenate: (s1: Wrapped<string>, s2: Wrapped<string>) => Wrapped<string>;
  lengthOfString?: (s: Wrapped<string>) => Wrapped<number>;
};

// The runtime threaded into every generated polyfill as the `$` parameter.
// Generated code routes EVERY operation on a value through these ops so an
// analysis can observe it. To support concolic execution (not just taint),
// even "decision values" (indices, lengths) are carried as Wrapped — they need
// a tracked identity. Control flow is preserved because the comparison/equality
// ops return a concrete `boolean` (so native `if`/`while`/`for`/`&&`/`||` work),
// while arithmetic ops return Wrapped to keep the symbolic value flowing.
export interface BootStrap {
  // String ops — indices are Wrapped too.
  length: (s: Wrapped<string>) => Wrapped<number>;
  substring: (s: Wrapped<string>, from: Wrapped<number>, to: Wrapped<number>) => Wrapped<string>;
  concatenate: (l: Wrapped<string>, r: Wrapped<string>) => Wrapped<string>;
  codeUnitAt: (s: Wrapped<string>, i: Wrapped<number>) => Wrapped<string>;

  // Arithmetic / bitwise — carry the result value (Wrapped).
  add: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  subtract: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  multiply: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  divide: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  remainder: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  negate: (x: Wrapped<number>) => Wrapped<number>;
  exponentiate: (b: Wrapped<number>, e: Wrapped<number>) => Wrapped<number>;
  bitwiseAND: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  bitwiseOR: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;
  bitwiseXOR: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<number>;

  // Comparison / equality / predicates — concrete `boolean` so control flow
  // and short-circuiting work natively. (PC recording for concolic: later.)
  lessThan: (l: Wrapped<number>, r: Wrapped<number>) => boolean;
  lessThanEqual: (l: Wrapped<number>, r: Wrapped<number>) => boolean;
  greaterThan: (l: Wrapped<number>, r: Wrapped<number>) => boolean;
  greaterThanEqual: (l: Wrapped<number>, r: Wrapped<number>) => boolean;
  // Type predicates so a `not-found`-style guard narrows a mixed return
  // (e.g. StringIndexOf's `Wrapped<string> | Wrapped<number>`): after
  // `if ($.is(pos, $.base("not-found"))) ...`, the else branch sees Wrapped<number>.
  is: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => l is Extract<L, R>;
  isNot: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => l is Exclude<L, R>;
  isNaN: (x: Wrapped<number>) => boolean;
  isFinite: (x: Wrapped<number>) => boolean;
  typeOf: (x: Wrapped<unknown>) => string;

  // Math notations — Wrapped, like the arithmetic ops.
  min: (...xs: Wrapped<number>[]) => Wrapped<number>;
  max: (...xs: Wrapped<number>[]) => Wrapped<number>;
  abs: (x: Wrapped<number>) => Wrapped<number>;
  floor: (x: Wrapped<number>) => Wrapped<number>;
  truncate: (x: Wrapped<number>) => Wrapped<number>;
  clamp: (x: Wrapped<number>, lower: Wrapped<number>, upper: Wrapped<number>) => Wrapped<number>;

  // List notations.
  append: <T>(list: T[], x: T) => T[];
  contains: <T>(list: T[], x: T) => boolean;

  // Basic operations.
  base: <T extends Unwrapped | Primitive>(v: T, parent: Wrapped[]) => Wrapped<T>;
  peek: <T>(wrapped: Wrapped<T>) => Unwrapped<T>;
}
