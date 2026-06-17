
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_with ($ : SpecRuntime, $this : Wrapped<unknown>, index : Wrapped<unknown>, value : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 223, $.greaterThanEqual(relativeIndex, $.base<number>(0, []))))
  {
    var actualIndex = relativeIndex;
  }
  else
  {
    var actualIndex = $.add((len as Wrapped<number>), (relativeIndex as Wrapped<number>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 224, $.greaterThanEqual(actualIndex, len)) || $.condition(Number.MAX_SAFE_INTEGER - 225, $.lessThan(actualIndex, $.base<number>(0, []))))
  {
    throw new RangeError;
  }

  var A = AO__ArrayCreate($, (len as Wrapped<number>));
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 226, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 227, $.is(k, actualIndex)))
    {
      var fromValue = value;
    }
    else
    {
      var fromValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    }

    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (Pk as Wrapped<unknown>), (fromValue as Wrapped<unknown>));
    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return A;
}
