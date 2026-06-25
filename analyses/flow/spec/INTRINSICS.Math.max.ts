// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_max ($ : SpecRuntime, $this : Lifted<unknown>, ...args : Lifted<unknown>[]) {
  var coerced = [] as Lifted<never>[];
  for (var arg of args)
  {
    var n = AO__ToNumber($, (arg as Lifted<unknown>));
    $.append(coerced, n)
  }

  var highest = $.lit<number>(-Infinity);
  for (var number of coerced)
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 299, $.isNaN(number as Lifted<number>)))
    {
      return $.lit<number>(NaN);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 300, $.is(number, $.lit<number>(0))) && $.condition(Number.MAX_SAFE_INTEGER - 301, $.is(highest, $.lit<number>(0))))
    {
      highest = $.lit<number>(0);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 302, $.greaterThan(number, highest)))
    {
      highest = number;
    }

  }

  return highest;
}
