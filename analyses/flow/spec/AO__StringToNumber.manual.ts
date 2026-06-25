import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToNumber($: SpecRuntime, V: Lifted<unknown>): Lifted<number> {
  return $.default(Number($.value(V)), [V]);
}
