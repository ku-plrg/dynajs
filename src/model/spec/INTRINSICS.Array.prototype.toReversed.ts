
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toReversed ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var A = AO__ArrayCreate($, (len as Wrapped<number>));
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 209, $.lessThan(k, len)))
  {
    var from = AO__ToString($, ($.subtract(($.subtract((len as Wrapped<number>), (k as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (Pk as Wrapped<unknown>), (fromValue as Wrapped<unknown>));
    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return A;
}
