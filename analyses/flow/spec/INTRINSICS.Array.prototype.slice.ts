// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_slice ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, end : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 205, $.is(relativeStart, $.lit<number>(-Infinity))))
  {
    var k = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 206, $.lessThan(relativeStart, $.lit<number>(0))))
    {
      var k = $.max($.add((len as Wrapped<number>), (relativeStart as Wrapped<number>)), $.lit<number>(0));
    }
    else
    {
      var k = $.min(relativeStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 207, $.is(end, $.lit<undefined>(undefined))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Wrapped<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 208, $.is(relativeEnd, $.lit<number>(-Infinity))))
  {
    var final = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 209, $.lessThan(relativeEnd, $.lit<number>(0))))
    {
      var final = $.max($.add((len as Wrapped<number>), (relativeEnd as Wrapped<number>)), $.lit<number>(0));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  var count = $.max($.subtract((final as Wrapped<number>), (k as Wrapped<number>)), $.lit<number>(0));
  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), (count as Wrapped<number>));
  var n = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 210, $.lessThan(k, final)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 211, $.is(kPresent, $.lit<boolean>(true))))
    {
      var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (n as Wrapped<unknown>)) as Wrapped<unknown>), (kValue as Wrapped<unknown>));
    }

    k = $.add((k as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
    n = $.add((n as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
  }

  AO__Set($, (A as Wrapped<unknown>), ($.lit<string>("length") as Wrapped<unknown>), (n as Wrapped<unknown>), ($.lit<boolean>(true) as Wrapped<boolean>));
  return A;
}
