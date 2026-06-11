
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__DefinePropertyOrThrow ($ : BootStrap, O : Wrapped<unknown>, P : Wrapped<unknown>, desc : Wrapped<unknown>) {
  var success = O["DefineOwnProperty"](P, desc);
  if ($.is(success, $.base<boolean>(false, [])))
  {
    throw new TypeError;
  }

  return $.base<string>("unused", []);
}
