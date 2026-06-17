
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_splice ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, deleteCount : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var startIsPresent = arguments.length > 2;
  var deleteCountIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 193, $.is(relativeStart, $.base<number>(-Infinity, []))))
  {
    var actualStart = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 194, $.lessThan(relativeStart, $.base<number>(0, []))))
    {
      var actualStart = $.max($.add((len as Wrapped<number>), (relativeStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var actualStart = $.min(relativeStart, len);
    }

  }

  var itemCount = $.base<number>(items.length, []);
  if (!startIsPresent)
  {
    var actualDeleteCount = $.base<number>(0, []);
  }
  else
  {
    if (!deleteCountIsPresent)
    {
      var actualDeleteCount = $.subtract((len as Wrapped<number>), (actualStart as Wrapped<number>));
    }
    else
    {
      var dc = AO__ToIntegerOrInfinity($, (deleteCount as Wrapped<unknown>));
      var actualDeleteCount = $.clamp(dc, $.base<number>(0, []), $.subtract((len as Wrapped<number>), (actualStart as Wrapped<number>)));
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 195, $.greaterThan($.subtract(($.add((len as Wrapped<number>), (itemCount as Wrapped<number>)) as Wrapped<number>), (actualDeleteCount as Wrapped<number>)), $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
  {
    throw new TypeError;
  }

  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), (actualDeleteCount as Wrapped<number>));
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 196, $.lessThan(k, actualDeleteCount)))
  {
    var from = AO__ToString($, ($.add((actualStart as Wrapped<number>), (k as Wrapped<number>)) as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 197, $.is(AO__HasProperty($, (O as Wrapped<unknown>), (from as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
      AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>), (fromValue as Wrapped<unknown>));
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  AO__Set($, (A as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), (actualDeleteCount as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 198, $.lessThan(itemCount, actualDeleteCount)))
  {
    k = actualStart;
    while ($.condition(Number.MAX_SAFE_INTEGER - 199, $.lessThan(k, $.subtract((len as Wrapped<number>), (actualDeleteCount as Wrapped<number>)))))
    {
      var from = AO__ToString($, ($.add((k as Wrapped<number>), (actualDeleteCount as Wrapped<number>)) as Wrapped<unknown>));
      var to = AO__ToString($, ($.add((k as Wrapped<number>), (itemCount as Wrapped<number>)) as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 200, $.is(AO__HasProperty($, (O as Wrapped<unknown>), (from as Wrapped<unknown>)), $.base<boolean>(true, []))))
      {
        var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
        AO__Set($, (O as Wrapped<unknown>), (to as Wrapped<unknown>), (fromValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
      }
      else
      {
        AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (to as Wrapped<unknown>));
      }

      k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

    k = len;
    while ($.condition(Number.MAX_SAFE_INTEGER - 201, $.greaterThan(k, $.add(($.subtract((len as Wrapped<number>), (actualDeleteCount as Wrapped<number>)) as Wrapped<number>), (itemCount as Wrapped<number>)))))
    {
      AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (AO__ToString($, ($.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>)) as Wrapped<unknown>));
      k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 202, $.greaterThan(itemCount, actualDeleteCount)))
    {
      k = $.subtract((len as Wrapped<number>), (actualDeleteCount as Wrapped<number>));
      while ($.condition(Number.MAX_SAFE_INTEGER - 203, $.greaterThan(k, actualStart)))
      {
        var from = AO__ToString($, ($.subtract(($.add((k as Wrapped<number>), (actualDeleteCount as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
        var to = AO__ToString($, ($.subtract(($.add((k as Wrapped<number>), (itemCount as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
        if ($.condition(Number.MAX_SAFE_INTEGER - 204, $.is(AO__HasProperty($, (O as Wrapped<unknown>), (from as Wrapped<unknown>)), $.base<boolean>(true, []))))
        {
          var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
          AO__Set($, (O as Wrapped<unknown>), (to as Wrapped<unknown>), (fromValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
        }
        else
        {
          AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (to as Wrapped<unknown>));
        }

        k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
      }

    }

  }

  k = actualStart;
  for (var _x0 = 0; _x0 < items.length; _x0++)
  {
    var E = items[_x0];
    AO__Set($, (O as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>), (E as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), ($.add(($.subtract((len as Wrapped<number>), (actualDeleteCount as Wrapped<number>)) as Wrapped<number>), (itemCount as Wrapped<number>)) as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  return A;
}
