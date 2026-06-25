import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__GetV($: SpecRuntime, V: Lifted<unknown>, P: Lifted<unknown>): Lifted<unknown> {
  // @ts-ignore $.peek(P) can be used as key.
  return $.base($.peek(V)[$.peek(P)], [V, P]);
  // TODO check if this transformation is correct? 
}
