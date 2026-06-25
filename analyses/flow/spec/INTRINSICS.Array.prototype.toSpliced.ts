// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toSpliced ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, skipCount : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var startIsPresent = arguments.length > 2;
  var skipCountIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var relativeStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 240, $.is(relativeStart, $.lit<number>(-Infinity))))
  {
    var actualStart = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 241, $.lessThan(relativeStart, $.lit<number>(0))))
    {
      var actualStart = $.max($.add((len as Lifted<number>), (relativeStart as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var actualStart = $.min(relativeStart, len);
    }

  }

  var insertCount = $.base<number>(items.length, []);
  if (!startIsPresent)
  {
    var actualSkipCount = $.lit<number>(0);
  }
  else
  {
    if (!skipCountIsPresent)
    {
      var actualSkipCount = $.subtract((len as Lifted<number>), (actualStart as Lifted<number>));
    }
    else
    {
      var sc = AO__ToIntegerOrInfinity($, (skipCount as Lifted<unknown>));
      var actualSkipCount = $.clamp(sc, $.lit<number>(0), $.subtract((len as Lifted<number>), (actualStart as Lifted<number>)));
    }

  }

  var newLen = $.subtract(($.add((len as Lifted<number>), (insertCount as Lifted<number>)) as Lifted<number>), (actualSkipCount as Lifted<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 242, $.greaterThan(newLen, $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(53)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>)))))
  {
    throw new TypeError;
  }

  var A = AO__ArrayCreate($, (newLen as Lifted<number>));
  var i = $.lit<number>(0);
  var r = $.add((actualStart as Lifted<number>), (actualSkipCount as Lifted<number>));
  while ($.condition(Number.MAX_SAFE_INTEGER - 243, $.lessThan(i, actualStart)))
  {
    var Pi = AO__ToString($, (i as Lifted<unknown>));
    var iValue = AO__Get($, (O as Lifted<unknown>), (Pi as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pi as Lifted<unknown>), (iValue as Lifted<unknown>));
    i = $.add((i as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  for (var E of items)
  {
    var Pi = AO__ToString($, (i as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pi as Lifted<unknown>), (E as Lifted<unknown>));
    i = $.add((i as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 244, $.lessThan(i, newLen)))
  {
    var Pi = AO__ToString($, (i as Lifted<unknown>));
    var from = AO__ToString($, (r as Lifted<unknown>));
    var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pi as Lifted<unknown>), (fromValue as Lifted<unknown>));
    i = $.add((i as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    r = $.add((r as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  return A;
}
