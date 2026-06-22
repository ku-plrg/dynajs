// @manual GetPrototypeFromConstructor (ECMA-262 10.1.13) — STUB
// Not yet modeled: requires reading constructor.[[Prototype]] / realm intrinsics
// through the object-model. Only reached via OrdinaryCreateFromConstructor (RegExp
// allocation in the String RegExp methods). Exists so the import resolves at
// build time.
import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__GetPrototypeFromConstructor(
  $: SpecRuntime,
  constructor: Wrapped<unknown>,
  intrinsicDefaultProto: Wrapped<string>,
): Wrapped<unknown> {
  throw new Error("AO__GetPrototypeFromConstructor: object-model is not implemented yet");
}
