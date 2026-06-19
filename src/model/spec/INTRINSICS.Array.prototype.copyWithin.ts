// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_copyWithin ($ : SpecRuntime, $this : Wrapped<unknown>, target : Wrapped<unknown>, start : Wrapped<unknown>, end : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeTarget = AO__ToIntegerOrInfinity($, (target as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 94, $.is(relativeTarget, $.base<number>(-Infinity, []))))
  {
    var to = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 95, $.lessThan(relativeTarget, $.base<number>(0, []))))
    {
      var to = $.max($.add((len as Wrapped<number>), (relativeTarget as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var to = $.min(relativeTarget, len);
    }

  }

  var relativeStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 96, $.is(relativeStart, $.base<number>(-Infinity, []))))
  {
    var from = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 97, $.lessThan(relativeStart, $.base<number>(0, []))))
    {
      var from = $.max($.add((len as Wrapped<number>), (relativeStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var from = $.min(relativeStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 98, $.is(end, $.base<undefined>(undefined, []))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Wrapped<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 99, $.is(relativeEnd, $.base<number>(-Infinity, []))))
  {
    var final = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 100, $.lessThan(relativeEnd, $.base<number>(0, []))))
    {
      var final = $.max($.add((len as Wrapped<number>), (relativeEnd as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  var count = $.min($.subtract((final as Wrapped<number>), (from as Wrapped<number>)), $.subtract((len as Wrapped<number>), (to as Wrapped<number>)));
  if ($.condition(Number.MAX_SAFE_INTEGER - 101, $.lessThan(from, to)) && $.condition(Number.MAX_SAFE_INTEGER - 102, $.lessThan(to, $.add((from as Wrapped<number>), (count as Wrapped<number>)))))
  {
    var direction = $.negate(($.base<number>(1, []) as Wrapped<number>));
    from = $.subtract(($.add((from as Wrapped<number>), (count as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    to = $.subtract(($.add((to as Wrapped<number>), (count as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }
  else
  {
    var direction = $.base<number>(1, []);
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 103, $.greaterThan(count, $.base<number>(0, []))))
  {
    var fromKey = AO__ToString($, (from as Wrapped<unknown>));
    var toKey = AO__ToString($, (to as Wrapped<unknown>));
    var fromPresent = AO__HasProperty($, (O as Wrapped<unknown>), (fromKey as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 104, $.is(fromPresent, $.base<boolean>(true, []))))
    {
      var fromValue = AO__Get($, (O as Wrapped<unknown>), (fromKey as Wrapped<unknown>));
      AO__Set($, (O as Wrapped<unknown>), (toKey as Wrapped<unknown>), (fromValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (toKey as Wrapped<unknown>));
    }

    from = $.add((from as Wrapped<number>), (direction as Wrapped<number>));
    to = $.add((to as Wrapped<number>), (direction as Wrapped<number>));
    count = $.subtract((count as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return O;
}
