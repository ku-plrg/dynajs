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

// The runtime threaded into every generated polyfill as `__runtime__`.
// Generated code calls these as `__runtime__.<op>(...)`. Unlike SpecOps, the
// vocabulary here follows the raw/wrapped contract directly: result values are
// carried (Wrapped), decision values (indices, lengths) are raw `number`.
// `peek`/`base` are intentionally NOT exposed — generated code never names them.
export interface BootStrap {
  // SpecOps vocabulary — carry the result value, propagate Info via flow hooks.
  length: (s: Wrapped<string>) => number;                                       // raw (decision value)
  substring: (s: Wrapped<string>, from: number, to: number) => Wrapped<string>; // raw indices
  concatenate: (l: Wrapped<string>, r: Wrapped<string>) => Wrapped<string>;

  // Internal notations with no SpecOps name — pure on raw numbers.
  IN__truncate: (x: number) => number;
  IN__clamp: (x: number, lower: number, upper: number) => number;
  IN__min: (...xs: number[]) => number;
  IN__max: (...xs: number[]) => number;
  IN__pow: (base: number, exponent: number) => number;

  // List notations.
  IN__Append: <T>(list: T[], x: T) => T[];
  IN__Contains: <T>(list: T[], x: T) => boolean;

  // Basic operations.
  base: <T extends Unwrapped | Primitive>(v: T, parent: Wrapped[]) => Wrapped<T>;
  peek: <T>(wrapped: Wrapped<T>) => Unwrapped<T>;
}
