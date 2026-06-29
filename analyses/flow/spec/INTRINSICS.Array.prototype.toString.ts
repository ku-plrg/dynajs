// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_toString ($ : SpecRuntime, $this : Lifted<unknown>) {
  var array = AO__ToObject($, $this);
  var func = AO__Get($, (array as Lifted<unknown>), ($.default<string>("join", []) as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 254, $.is(AO__IsCallable($, (func as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    func = $.default(Object.prototype.toString as Function as Unlifted<Function>, []);
  }

  return AO__Call($, (func as Lifted<unknown>), (array as Lifted<unknown>));
}
