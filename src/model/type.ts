declare const WrappedValueBrand: unique symbol;

export type Wrapped<T = unknown> = T & { readonly [WrappedValueBrand]: true; };

export type Unwrapped<T = unknown> = T & { readonly [WrappedValueBrand]: false; };

// Primitives are (implicit) subtype of unwrapped, but unwrapped is not necessarily primitive (e.g. it can be an object that has been unwrapped)
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

interface SpecOps extends StringOps, ArithmeticOps, CompareOps, MathOps, ListOps, RangeOps {
  // default propagation: unwrapped -> wrapped
  base: <T extends Unwrapped | Primitive>(v: T, parent: Wrapped[]) => Wrapped<T>;
  // wrapped -> unwrapped
  peek: <T>(wrapped: Wrapped<T>) => Unwrapped<T>;
}

interface StringOps {
  substring: (s: Wrapped<string>, start: Wrapped<number>, end: Wrapped<number>) => Wrapped<string>;
  concatenate: (s1: Wrapped<string>, s2: Wrapped<string>) => Wrapped<string>;
  length: (s: Wrapped<string>) => Wrapped<number>;
  codeUnitAt: (s: Wrapped<string>, i: Wrapped<number>) => Wrapped<string>;
  trim: (s: Wrapped<string>, leading: boolean, trailing: boolean) => Wrapped<string>;
};

interface ArithmeticOps {
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
}

interface CompareOps {

  // Ordering comparisons carry the decision symbolically: they return a
  // Wrapped<boolean> (so an analysis like concolic can attach the comparison's Sym), which
  // codegen immediately funnels through `condition` to recover a raw boolean for
  // native control flow. A Wrapped boolean is a truthy proxy, so it must NOT be
  // used directly in `if`/`&&`/`||` — generated code always wraps each ordering
  // comparison in `condition(...)` at the branch site.
  lessThan: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  lessThanEqual: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  greaterThan: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  greaterThanEqual: (l: Wrapped<number>, r: Wrapped<number>) => Wrapped<boolean>;
  condition: (bid: number, cond: Wrapped<boolean>) => boolean;
  is: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => Wrapped<boolean /* l is Extract<L, R> */>;
  isNot: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => Wrapped<boolean /* l is Exclude<L, R> */>;
  isNaN: (x: Wrapped<number>) => boolean;
  isFinite: (x: Wrapped<number>) => boolean;
  // "object" excludes null, and includes functions. "function" check is done via `AO__IsCallable`.
  isType: (x: Wrapped<unknown>, ty: 'object' | 'null' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol' | 'bigint') => boolean;
}

interface MathOps {
  // Math notations — Wrapped, like the arithmetic ops.
  min: (...xs: Wrapped<number>[]) => Wrapped<number>;
  max: (...xs: Wrapped<number>[]) => Wrapped<number>;
  abs: (x: Wrapped<number>) => Wrapped<number>;
  floor: (x: Wrapped<number>) => Wrapped<number>;
  truncate: (x: Wrapped<number>) => Wrapped<number>;
  clamp: (x: Wrapped<number>, lower: Wrapped<number>, upper: Wrapped<number>) => Wrapped<number>;
}

interface ListOps {
  // List notations.
  append: <T>(list: T[], x: T) => T[];
  // Models the spec's "Prepend X to Y" notation (e.g. Array.prototype.concat
  // prepends O to items). Generated as `prepend(list, x)` — adds x to the
  // front of list.
  prepend: <T>(list: T[], x: T) => T[];
  contains: <T>(list: T[], x: T) => boolean;
}

// The integers in an interval [lo, hi] (inclusivity per `loInclusive`/`hiInclusive`),
// in ascending or descending order, as the array of index values — driven by a
// native `for...of` in generated code (arrays are iterable). One op for both spec
// phrasings of the same concept: a "For each integer i such that lo ≤/< i ≤/< hi"
// step (ForEachIntegerStep) and the "a List of the integers in the interval from X
// to Y" expression notation (e.g. FindViaPredicate), which is just an integer loop
// spelled via an intermediate List.
interface RangeOps {
  // Each index is a Wrapped value carrying `rangeInfo` (see FlowAnalysis), so a user
  // analysis can model the loop — including a symbolic `hi` (e.g. a string `length`)
  // — as a unit instead of reconstructing it from per-step ops. `bid` keys the
  // loop-bound branch for the analysis. Without a `rangeInfo` hook the indices fall
  // back to deriving from the bounds (`baseInfo`).
  range: (lo: Wrapped<number>, loInclusive: boolean, hi: Wrapped<number>, hiInclusive: boolean, ascending: boolean, bid: number) => Wrapped<number>[];
}

// The runtime threaded into every generated polyfill as the `$` parameter.
// Generated code routes EVERY operation on a value through these ops so an
// analysis can observe it. To support concolic execution (not just taint),
// even "decision values" (indices, lengths) are carried as Wrapped — they need
// a tracked identity. Control flow is preserved because the comparison/equality
// ops return a concrete `boolean` (so native `if`/`while`/`for`/`&&`/`||` work),
// while arithmetic ops return Wrapped to keep the symbolic value flowing.
export interface SpecRuntime extends SpecOps {

  // A Wrapped `undefined`, used as the default value for absent optional
  // parameters. Keeping it Wrapped means the value domain stays uniform (no raw
  // `undefined` leaks into generated polyfills), so a plain `name? : Wrapped<T>`
  // — which would be `Wrapped<T> | undefined` and break `$.is`'s `Wrapped<unknown>`
  // constraint — is instead rendered as `name : Wrapped<T> = $.undef`.
  undef: Wrapped<undefined>;
}
