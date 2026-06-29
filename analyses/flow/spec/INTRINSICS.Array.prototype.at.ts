// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_at ($ : SpecRuntime, $this : Lifted<unknown>, index : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 116, $.greaterThanEqual(relativeIndex, $.default<number>(0, [])))))
  {
    var k = relativeIndex;
  }
  else
  {
    var k = $.add((len as Lifted<number>), (relativeIndex as Lifted<number>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 117, $.lessThan(k, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 118, $.greaterThanEqual(k, len))))
  {
    return $.default<undefined>(undefined, []);
  }

  return AO__Get($, (O as Lifted<unknown>), (AO__ToString($, (k as Lifted<unknown>)) as Lifted<unknown>));
}
