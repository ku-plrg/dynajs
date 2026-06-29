// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_fill ($ : SpecRuntime, $this : Lifted<unknown>, value : Lifted<unknown>, start : Lifted<unknown> = $.default<undefined>(undefined, []), end : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 139, $.is(relativeStart, $.default<number>(-Infinity, [])))))
  {
    var k = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 140, $.lessThan(relativeStart, $.default<number>(0, [])))))
    {
      var k = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var k = $.min(relativeStart, len);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 141, $.is(end, $.default<undefined>(undefined, [])))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 142, $.is(relativeEnd, $.default<number>(-Infinity, [])))))
  {
    var final = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 143, $.lessThan(relativeEnd, $.default<number>(0, [])))))
    {
      var final = $.max($.add((len as Lifted<number>), (relativeEnd as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 144, $.lessThan(k, final))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    AO__Set($, (O as Lifted<unknown>), (Pk as Lifted<unknown>), (value as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return O;
}
