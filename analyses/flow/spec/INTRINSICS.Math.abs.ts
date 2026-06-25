// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_abs ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 283, $.isNaN(n as Lifted<number>))))
  {
    return $.default<number>(NaN, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 284, $.is(n, $.default<number>(0, [])))))
  {
    return $.default<number>(0, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 285, $.is(n, $.default<number>(-Infinity, [])))))
  {
    return $.default<number>(Infinity, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 286, $.lessThan(n, $.default<number>(0, [])))))
  {
    return $.negate((n as Lifted<number>));
  }

  return n;
}
