import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToNumber($: SpecRuntime, V: Lifted<unknown>): Lifted<number> {
  return $.base(Number($.peek(V)), [V]);
}
