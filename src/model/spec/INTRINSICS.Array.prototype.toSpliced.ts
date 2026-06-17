
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toSpliced ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, skipCount : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var startIsPresent = arguments.length > 2;
  var skipCountIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 213, $.is(relativeStart, $.base<number>(-Infinity, []))))
  {
    var actualStart = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 214, $.lessThan(relativeStart, $.base<number>(0, []))))
    {
      var actualStart = $.max($.add((len as Wrapped<number>), (relativeStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var actualStart = $.min(relativeStart, len);
    }

  }

  var insertCount = $.base<number>(items.length, []);
  if (!startIsPresent)
  {
    var actualSkipCount = $.base<number>(0, []);
  }
  else
  {
    if (!skipCountIsPresent)
    {
      var actualSkipCount = $.subtract((len as Wrapped<number>), (actualStart as Wrapped<number>));
    }
    else
    {
      var sc = AO__ToIntegerOrInfinity($, (skipCount as Wrapped<unknown>));
      var actualSkipCount = $.clamp(sc, $.base<number>(0, []), $.subtract((len as Wrapped<number>), (actualStart as Wrapped<number>)));
    }

  }

  var newLen = $.subtract(($.add((len as Wrapped<number>), (insertCount as Wrapped<number>)) as Wrapped<number>), (actualSkipCount as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 215, $.greaterThan(newLen, $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
  {
    throw new TypeError;
  }

  var A = AO__ArrayCreate($, (newLen as Wrapped<number>));
  var i = $.base<number>(0, []);
  var r = $.add((actualStart as Wrapped<number>), (actualSkipCount as Wrapped<number>));
  while ($.condition(Number.MAX_SAFE_INTEGER - 216, $.lessThan(i, actualStart)))
  {
    var Pi = AO__ToString($, (i as Wrapped<unknown>));
    var iValue = AO__Get($, (O as Wrapped<unknown>), (Pi as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (Pi as Wrapped<unknown>), (iValue as Wrapped<unknown>));
    i = $.add((i as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  for (var _x0 = 0; _x0 < items.length; _x0++)
  {
    var E = items[_x0];
    var Pi = AO__ToString($, (i as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (Pi as Wrapped<unknown>), (E as Wrapped<unknown>));
    i = $.add((i as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 217, $.lessThan(i, newLen)))
  {
    var Pi = AO__ToString($, (i as Wrapped<unknown>));
    var from = AO__ToString($, (r as Wrapped<unknown>));
    var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (Pi as Wrapped<unknown>), (fromValue as Wrapped<unknown>));
    i = $.add((i as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    r = $.add((r as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return A;
}
