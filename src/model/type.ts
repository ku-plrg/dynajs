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
};
