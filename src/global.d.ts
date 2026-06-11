// global.d.ts
export {};
import type * as model from "@/model/type.js";

declare global {
  type AssertType<T extends true> = T;
  type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;
  type Wrapped<T> = model.Wrapped<T>;
  type Unwrapped<T> = model.Unwrapped<T>;
  type SpecRuntime = model.SpecRuntime;
}