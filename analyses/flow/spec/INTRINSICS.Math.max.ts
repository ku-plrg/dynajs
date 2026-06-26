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

  var highest = $.default<number>(-Infinity, []);
  for (var number of coerced)
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 303, $.isNaN(number as Lifted<number>))))
    {
      return $.default<number>(NaN, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 304, $.is(number, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 305, $.is(highest, $.default<number>(0, [])))))
    {
      highest = $.default<number>(0, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 306, $.greaterThan(number, highest))))
    {
      highest = number;
    }

  }

  return highest;
}
