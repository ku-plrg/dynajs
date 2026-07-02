
import type { Lifted, LiftedTransfer } from "../type.js";

export function AO__IsRegExp ($ : LiftedTransfer, argument : Lifted<unknown>) {
  if (!($.value($.isType(argument, "object"))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>($.value(argument) instanceof RegExp, []);
}
