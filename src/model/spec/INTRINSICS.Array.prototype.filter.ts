
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__Call } from "./AO__Call.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_filter ($ : SpecRuntime, $this : Wrapped<unknown>, callback : Wrapped<unknown>, thisArg : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 109, $.is(AO__IsCallable($, (callback as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<number>));
  var k = $.base<number>(0, []);
  var to = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 110, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 111, $.is(kPresent, $.base<boolean>(true, []))))
    {
      var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      var selected = AO__ToBoolean($, (AO__Call($, (callback as Wrapped<unknown>), (thisArg as Wrapped<unknown>), ([kValue, k, O] as Wrapped<unknown>[])) as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 112, $.is(selected, $.base<boolean>(true, []))))
      {
        AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (to as Wrapped<unknown>)) as Wrapped<unknown>), (kValue as Wrapped<unknown>));
        to = $.add((to as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
      }

    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return A;
}
