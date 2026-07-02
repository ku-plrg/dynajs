import type { LiftedTransfer, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__IsCallable($: LiftedTransfer, argument : Lifted<unknown>) : Lifted<boolean> {
  "use strict";

  const arg = $.value(argument);

  return $.default(typeof arg === "function", []);
}
