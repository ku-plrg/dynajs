
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_fill ($ : SpecRuntime, $this : Wrapped<unknown>, value : Wrapped<unknown>, start : Wrapped<unknown> = $.undef, end : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 103, $.is(relativeStart, $.base<number>(-Infinity, []))))
  {
    var k = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 104, $.lessThan(relativeStart, $.base<number>(0, []))))
    {
      var k = $.max($.add((len as Wrapped<number>), (relativeStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var k = $.min(relativeStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 105, $.is(end, $.base<undefined>(undefined, []))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Wrapped<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 106, $.is(relativeEnd, $.base<number>(-Infinity, []))))
  {
    var final = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 107, $.lessThan(relativeEnd, $.base<number>(0, []))))
    {
      var final = $.max($.add((len as Wrapped<number>), (relativeEnd as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 108, $.lessThan(k, final)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    AO__Set($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>), (value as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return O;
}
