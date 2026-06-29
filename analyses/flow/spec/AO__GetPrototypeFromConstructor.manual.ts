import type { Lifted, SpecRuntime } from "../type.js";

export function AO__GetPrototypeFromConstructor ($ : SpecRuntime, constructor : Lifted<unknown>, defaultProto : Lifted<unknown>) {
  var proto = $.get(constructor, ($.default<string>("prototype", []) as Lifted<string>));
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 428, $.isType(proto, "object")))))
  {
    proto = defaultProto;
  }

  return proto;
}