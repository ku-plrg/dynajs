// global.d.ts
export {};

declare global {
  type AssertType<T extends true> = T;
  type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;
}