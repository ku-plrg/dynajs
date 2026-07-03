import type { LiftedTransferOps, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__ToObject } from "./AO__ToObject.js";

export function AO__GetV($: LiftedTransferOps, V: Lifted<unknown>, P: Lifted<unknown>): Lifted<unknown> {
  const O = AO__ToObject($, V);
  return $.get(O, P);
}
