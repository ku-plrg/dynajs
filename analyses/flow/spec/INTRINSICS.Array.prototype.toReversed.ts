// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toReversed ($ : SpecRuntime, $this : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var A = AO__ArrayCreate($, (len as Lifted<number>));
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 245, $.lessThan(k, len))))
  {
    var from = AO__ToString($, ($.subtract(($.subtract((len as Lifted<number>), (k as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>));
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pk as Lifted<unknown>), (fromValue as Lifted<unknown>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return A;
}
