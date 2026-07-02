import type { LiftedTransfer, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToNumber($: LiftedTransfer, V: Lifted<unknown>): Lifted<number> {
  return $.default(Number($.value(V)), [V]);
}
