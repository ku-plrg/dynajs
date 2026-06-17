
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_toString ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var array = AO__ToObject($, $this);
  var func = AO__Get($, (array as Wrapped<unknown>), ($.base<string>("join", []) as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 218, $.is(AO__IsCallable($, (func as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    func = Object.prototype.toString;
  }

  return AO__Call($, (func as Wrapped<unknown>), (array as Wrapped<unknown>));
}
