// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_min ($ : SpecRuntime, $this : Lifted<unknown>, ...args : Lifted<unknown>[]) {
  var coerced = [] as Lifted<never>[];
  for (var arg of args)
  {
    var n = AO__ToNumber($, (arg as Lifted<unknown>));
    $.append(coerced, n)
  }

  var lowest = $.lit<number>(Infinity);
  for (var number of coerced)
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 303, $.isNaN(number as Lifted<number>)))
    {
      return $.lit<number>(NaN);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 304, $.is(number, $.lit<number>(0))) && $.condition(Number.MAX_SAFE_INTEGER - 305, $.is(lowest, $.lit<number>(0))))
    {
      lowest = $.lit<number>(0);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 306, $.lessThan(number, lowest)))
    {
      lowest = number;
    }

  }

  return lowest;
}
