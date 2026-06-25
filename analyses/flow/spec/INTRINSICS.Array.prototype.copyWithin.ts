// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_copyWithin ($ : SpecRuntime, $this : Lifted<unknown>, target : Lifted<unknown>, start : Lifted<unknown>, end : Lifted<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeTarget = AO__ToIntegerOrInfinity($, (target as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 115, $.is(relativeTarget, $.lit<number>(-Infinity))))
  {
    var to = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 116, $.lessThan(relativeTarget, $.lit<number>(0))))
    {
      var to = $.max($.add((len as Lifted<number>), (relativeTarget as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var to = $.min(relativeTarget, len);
    }

  }

  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 117, $.is(relativeStart, $.lit<number>(-Infinity))))
  {
    var from = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 118, $.lessThan(relativeStart, $.lit<number>(0))))
    {
      var from = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var from = $.min(relativeStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 119, $.is(end, $.lit<undefined>(undefined))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 120, $.is(relativeEnd, $.lit<number>(-Infinity))))
  {
    var final = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 121, $.lessThan(relativeEnd, $.lit<number>(0))))
    {
      var final = $.max($.add((len as Lifted<number>), (relativeEnd as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  var count = $.min($.subtract((final as Lifted<number>), (from as Lifted<number>)), $.subtract((len as Lifted<number>), (to as Lifted<number>)));
  if ($.condition(Number.MAX_SAFE_INTEGER - 122, $.lessThan(from, to)) && $.condition(Number.MAX_SAFE_INTEGER - 123, $.lessThan(to, $.add((from as Lifted<number>), (count as Lifted<number>)))))
  {
    var direction = $.negate(($.lit<number>(1) as Lifted<number>));
    from = $.subtract(($.add((from as Lifted<number>), (count as Lifted<number>)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    to = $.subtract(($.add((to as Lifted<number>), (count as Lifted<number>)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }
  else
  {
    var direction = $.lit<number>(1);
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 124, $.greaterThan(count, $.lit<number>(0))))
  {
    var fromKey = AO__ToString($, (from as Lifted<unknown>));
    var toKey = AO__ToString($, (to as Lifted<unknown>));
    var fromPresent = AO__HasProperty($, (O as Lifted<unknown>), (fromKey as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 125, $.is(fromPresent, $.lit<boolean>(true))))
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (fromKey as Lifted<unknown>));
      AO__Set($, (O as Lifted<unknown>), (toKey as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (toKey as Lifted<unknown>));
    }

    from = $.add((from as Lifted<number>), (direction as Lifted<number>));
    to = $.add((to as Lifted<number>), (direction as Lifted<number>));
    count = $.subtract((count as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  return O;
}
