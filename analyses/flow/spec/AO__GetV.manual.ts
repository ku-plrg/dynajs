import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__GetV($: SpecRuntime, V: Wrapped<unknown>, P: Wrapped<unknown>): Wrapped<unknown> {
  // @ts-ignore $.peek(P) can be used as key.
  return $.base($.peek(V)[$.peek(P)], [V, P]);
  // TODO check if this transformation is correct? 
}
