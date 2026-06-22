// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_at ($ : SpecRuntime, $this : Wrapped<unknown>, index : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 98, $.greaterThanEqual(relativeIndex, $.base<number>(0, []))))
  {
    var k = relativeIndex;
  }
  else
  {
    var k = $.add((len as Wrapped<number>), (relativeIndex as Wrapped<number>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 99, $.lessThan(k, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 100, $.greaterThanEqual(k, len)))
  {
    return $.base<undefined>(undefined, []);
  }

  return AO__Get($, (O as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>));
}
