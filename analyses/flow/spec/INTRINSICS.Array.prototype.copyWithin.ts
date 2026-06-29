// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_copyWithin ($ : SpecRuntime, $this : Lifted<unknown>, target : Lifted<unknown>, start : Lifted<unknown>, end : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeTarget = AO__ToIntegerOrInfinity($, (target as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 124, $.is(relativeTarget, $.default<number>(-Infinity, [])))))
  {
    var to = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 125, $.lessThan(relativeTarget, $.default<number>(0, [])))))
    {
      var to = $.max($.add((len as Lifted<number>), (relativeTarget as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var to = $.min(relativeTarget, len);
    }

  }

  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 126, $.is(relativeStart, $.default<number>(-Infinity, [])))))
  {
    var from = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 127, $.lessThan(relativeStart, $.default<number>(0, [])))))
    {
      var from = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var from = $.min(relativeStart, len);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 128, $.is(end, $.default<undefined>(undefined, [])))))
  {
    var relativeEnd = len;
  }
  else
  {
    var relativeEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 129, $.is(relativeEnd, $.default<number>(-Infinity, [])))))
  {
    var final = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 130, $.lessThan(relativeEnd, $.default<number>(0, [])))))
    {
      var final = $.max($.add((len as Lifted<number>), (relativeEnd as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var final = $.min(relativeEnd, len);
    }

  }

  var count = $.min($.subtract((final as Lifted<number>), (from as Lifted<number>)), $.subtract((len as Lifted<number>), (to as Lifted<number>)));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 131, $.lessThan(from, to))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 132, $.lessThan(to, $.add((from as Lifted<number>), (count as Lifted<number>))))))
  {
    var direction = $.negate(($.default<number>(1, []) as Lifted<number>));
    from = $.subtract(($.add((from as Lifted<number>), (count as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    to = $.subtract(($.add((to as Lifted<number>), (count as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }
  else
  {
    var direction = $.default<number>(1, []);
  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 133, $.greaterThan(count, $.default<number>(0, [])))))
  {
    var fromKey = AO__ToString($, (from as Lifted<unknown>));
    var toKey = AO__ToString($, (to as Lifted<unknown>));
    var fromPresent = AO__HasProperty($, (O as Lifted<unknown>), (fromKey as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 134, $.is(fromPresent, $.default<boolean>(true, [])))))
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (fromKey as Lifted<unknown>));
      AO__Set($, (O as Lifted<unknown>), (toKey as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (toKey as Lifted<unknown>));
    }

    from = $.add((from as Lifted<number>), (direction as Lifted<number>));
    to = $.add((to as Lifted<number>), (direction as Lifted<number>));
    count = $.subtract((count as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return O;
}
