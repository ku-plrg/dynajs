
import type { Lifted, LiftedTransferOps } from "../type.js";

export function AO__IsRegExp ($ : LiftedTransferOps, argument : Lifted<unknown>) {
  if (!($.value($.isType(argument, "object"))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>($.value(argument) instanceof RegExp, []);
}
