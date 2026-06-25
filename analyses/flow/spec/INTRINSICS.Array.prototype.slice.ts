// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_slice ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, end : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 205, $.is(relativeStart, $.lit<number>(-Infinity))))
  {
    var k = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 206, $.lessThan(relativeStart, $.lit<number>(0))))
    {
      var k = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.lit<number>(0));
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
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 208, $.is(relativeEnd, $.lit<number>(-Infinity))))
  {
    var final = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 209, $.lessThan(relativeEnd, $.lit<number>(0))))
    {
      var final = $.max($.add((len as Lifted<number>), (relativeEnd as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  var count = $.max($.subtract((final as Lifted<number>), (k as Lifted<number>)), $.lit<number>(0));
  var A = AO__ArraySpeciesCreate($, (O as Lifted<unknown>), (count as Lifted<number>));
  var n = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 210, $.lessThan(k, final)))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 211, $.is(kPresent, $.lit<boolean>(true))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (AO__ToString($, (n as Lifted<unknown>)) as Lifted<unknown>), (kValue as Lifted<unknown>));
    }

    k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    n = $.add((n as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  AO__Set($, (A as Lifted<unknown>), ($.lit<string>("length") as Lifted<unknown>), (n as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
  return A;
}
