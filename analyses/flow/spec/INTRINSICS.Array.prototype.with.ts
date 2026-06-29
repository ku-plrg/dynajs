// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_with ($ : SpecRuntime, $this : Lifted<unknown>, index : Lifted<unknown>, value : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 259, $.greaterThanEqual(relativeIndex, $.default<number>(0, [])))))
  {
    var actualIndex = relativeIndex;
  }
  else
  {
    var actualIndex = $.add((len as Lifted<number>), (relativeIndex as Lifted<number>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 260, $.greaterThanEqual(actualIndex, len))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 261, $.lessThan(actualIndex, $.default<number>(0, [])))))
  {
    throw new RangeError;
  }

  var A = AO__ArrayCreate($, (len as Lifted<number>));
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 262, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 263, $.is(k, actualIndex))))
    {
      var fromValue = value;
    }
    else
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    }

    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pk as Lifted<unknown>), (fromValue as Lifted<unknown>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return A;
}
