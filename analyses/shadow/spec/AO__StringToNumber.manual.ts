import type { LiftedTransferOps, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToNumber($: LiftedTransferOps, V: Lifted<unknown>): Lifted<number> {
  return $.default(Number($.value(V)), [V]);
}
