import type { Lifted, LiftedTransfer } from "../type.js";

export function AO__GetPrototypeFromConstructor ($ : LiftedTransfer, constructor : Lifted<unknown>, defaultProto : Lifted<unknown>) {
  var proto = $.get(constructor, ($.default<string>("prototype", []) as Lifted<string>));
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 428, $.isType(proto, "object")))))
  {
    proto = defaultProto;
  }

  return proto;
}