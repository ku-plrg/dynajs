declare const WrappedValueBrand: unique symbol;

export type Wrapped<T = unknown> = T & { readonly [WrappedValueBrand]: true; };

export type Unwrapped<T = unknown> = T & { readonly [WrappedValueBrand]: false; };

// Primitives are (implicit) subtype of unwrapped, but unwrapped is not necessarily primitive (e.g. it can be an object that has been unwrapped)
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export interface SpecOps extends StringOps, ArithmeticOps, CompareOps, MathOps, ListOps {
  // default propagation: unwrapped -> wrapped
  base: <T extends Unwrapped | Primitive>(v: T, parent: Wrapped[]) => Wrapped<T>;
  // Op-aware annotation of an already-computed binary result (post-hoc): routes
  // through the analysis's `binaryInfo` hook, else `base` flow-through. Lets the
  // spec AO `ApplyStringOrNumericBinaryOperator` annotate its numeric result
  // with the operator (e.g. `x - 2` vs `x + 2`) instead of an op-blind `base`.
  binary: (op: string, left: Wrapped, right: Wrapped, result: Unwrapped) => Wrapped;
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
  // A branch point: record `cond`'s symbolic form as a (flippable) path
  // constraint keyed by the codegen-assigned branch id `bid`, then return the
  // raw boolean so native `if`/`while`/`&&`/`||` and short-circuiting work. The
  // model-side mirror of the instrumenter's `D$.C(id, op, value)` on user code.
  condition: (bid: number, cond: Wrapped<boolean>) => boolean;
  // Type predicates so a `not-found`-style guard narrows a mixed return
  // (e.g. StringIndexOf's `Wrapped<string> | Wrapped<number>`): after
  // `if ($.is(pos, $.base("not-found"))) ...`, the else branch sees Wrapped<number>.
  is: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => l is Extract<L, R>;
  isNot: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R) => l is Exclude<L, R>;
  isNaN: (x: Wrapped<number>) => boolean;
  isFinite: (x: Wrapped<number>) => boolean;
  // "Type(x) is <ty>" — the runtime decides each type's membership (so e.g.
  // "object" excludes null and includes functions, which a bare `typeof` gets
  // wrong). Generated code routes every spec type-check through here. Raw boolean
  // for direct use in `if`.
  isType: (x: Wrapped<unknown>, ty: string) => boolean;
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
  contains: <T>(list: T[], x: T) => boolean;
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
