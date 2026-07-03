import type { LiftedTransferOps, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__IsCallable($: LiftedTransferOps, argument : Lifted<unknown>) : Lifted<boolean> {
  "use strict";

  const arg = $.value(argument);

  return $.default(typeof arg === "function", []);
}
