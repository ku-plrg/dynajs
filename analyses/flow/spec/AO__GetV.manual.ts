import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__GetV($: SpecRuntime, V: Lifted<unknown>, P: Lifted<unknown>): Lifted<unknown> {
  // @ts-ignore $.value(P) can be used as key.
  return $.default($.value(V)[$.value(P)], [V, P]);
  // TODO check if this transformation is correct? 
}
