// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

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

export function INTRINSICS_Array_prototype_splice ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, deleteCount : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var startIsPresent = arguments.length > 2;
  var deleteCountIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 229, $.is(relativeStart, $.default<number>(-Infinity, [])))))
  {
    var actualStart = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 230, $.lessThan(relativeStart, $.default<number>(0, [])))))
    {
      var actualStart = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var actualStart = $.min(relativeStart, len);
    }

  }

  var itemCount = $.default<number>(items.length, []);
  if (!startIsPresent)
  {
    var actualDeleteCount = $.default<number>(0, []);
  }
  else
  {
    if (!deleteCountIsPresent)
    {
      var actualDeleteCount = $.subtract((len as Lifted<number>), (actualStart as Lifted<number>));
    }
    else
    {
      var dc = AO__ToIntegerOrInfinity($, (deleteCount as Lifted<unknown>));
      var actualDeleteCount = $.clamp(dc, $.default<number>(0, []), $.subtract((len as Lifted<number>), (actualStart as Lifted<number>)));
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 231, $.greaterThan($.subtract(($.add((len as Lifted<number>), (itemCount as Lifted<number>)) as Lifted<number>), (actualDeleteCount as Lifted<number>)), $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
  {
    throw new TypeError;
  }

  var A = AO__ArraySpeciesCreate($, (O as Lifted<unknown>), (actualDeleteCount as Lifted<number>));
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 232, $.lessThan(k, actualDeleteCount))))
  {
    var from = AO__ToString($, ($.add((actualStart as Lifted<number>), (k as Lifted<number>)) as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 233, $.is(AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
      AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (AO__ToString($, (k as Lifted<unknown>)) as Lifted<unknown>), (fromValue as Lifted<unknown>));
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__Set($, (A as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (actualDeleteCount as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 234, $.lessThan(itemCount, actualDeleteCount))))
  {
    k = actualStart;
    while ($.value($.condition(Number.MAX_SAFE_INTEGER - 235, $.lessThan(k, $.subtract((len as Lifted<number>), (actualDeleteCount as Lifted<number>))))))
    {
      var from = AO__ToString($, ($.add((k as Lifted<number>), (actualDeleteCount as Lifted<number>)) as Lifted<unknown>));
      var to = AO__ToString($, ($.add((k as Lifted<number>), (itemCount as Lifted<number>)) as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 236, $.is(AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>)), $.default<boolean>(true, [])))))
      {
        var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
        AO__Set($, (O as Lifted<unknown>), (to as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
      }
      else
      {
        AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (to as Lifted<unknown>));
      }

      k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

    k = len;
    while ($.value($.condition(Number.MAX_SAFE_INTEGER - 237, $.greaterThan(k, $.add(($.subtract((len as Lifted<number>), (actualDeleteCount as Lifted<number>)) as Lifted<number>), (itemCount as Lifted<number>))))))
    {
      AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (AO__ToString($, ($.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>)) as Lifted<unknown>));
      k = $.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 238, $.greaterThan(itemCount, actualDeleteCount))))
    {
      k = $.subtract((len as Lifted<number>), (actualDeleteCount as Lifted<number>));
      while ($.value($.condition(Number.MAX_SAFE_INTEGER - 239, $.greaterThan(k, actualStart))))
      {
        var from = AO__ToString($, ($.subtract(($.add((k as Lifted<number>), (actualDeleteCount as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>));
        var to = AO__ToString($, ($.subtract(($.add((k as Lifted<number>), (itemCount as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>));
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 240, $.is(AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>)), $.default<boolean>(true, [])))))
        {
          var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
          AO__Set($, (O as Lifted<unknown>), (to as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
        }
        else
        {
          AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (to as Lifted<unknown>));
        }

        k = $.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
      }

    }

  }

  k = actualStart;
  for (var E of items)
  {
    AO__Set($, (O as Lifted<unknown>), (AO__ToString($, (k as Lifted<unknown>)) as Lifted<unknown>), (E as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__Set($, (O as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), ($.add(($.subtract((len as Lifted<number>), (actualDeleteCount as Lifted<number>)) as Lifted<number>), (itemCount as Lifted<number>)) as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return A;
}
