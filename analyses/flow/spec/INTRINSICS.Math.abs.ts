// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_abs ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 283, $.isNaN(n as Lifted<number>)))
  {
    return $.lit<number>(NaN);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 284, $.is(n, $.lit<number>(0))))
  {
    return $.lit<number>(0);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 285, $.is(n, $.lit<number>(-Infinity))))
  {
    return $.lit<number>(Infinity);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 286, $.lessThan(n, $.lit<number>(0))))
  {
    return $.negate((n as Lifted<number>));
  }

  return n;
}
