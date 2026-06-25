// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_fill ($ : SpecRuntime, $this : Lifted<unknown>, value : Lifted<unknown>, start : Lifted<unknown> = $.undef, end : Lifted<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 130, $.is(relativeStart, $.lit<number>(-Infinity))))
  {
    var k = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 131, $.lessThan(relativeStart, $.lit<number>(0))))
    {
      var k = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var k = $.min(relativeStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 132, $.is(end, $.lit<undefined>(undefined))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 133, $.is(relativeEnd, $.lit<number>(-Infinity))))
  {
    var final = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 134, $.lessThan(relativeEnd, $.lit<number>(0))))
    {
      var final = $.max($.add((len as Lifted<number>), (relativeEnd as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 135, $.lessThan(k, final)))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    AO__Set($, (O as Lifted<unknown>), (Pk as Lifted<unknown>), (value as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
    k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  return O;
}
