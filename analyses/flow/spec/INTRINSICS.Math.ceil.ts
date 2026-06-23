// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_ceil ($ : SpecRuntime, $this : Wrapped<unknown>, x : Wrapped<unknown>) {
  var n = AO__ToNumber($, (x as Wrapped<unknown>));
  if (!$.isFinite(n) || ($.condition(Number.MAX_SAFE_INTEGER - 267, $.is(n, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 268, $.is(n, $.base<number>(0, [])))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 269, $.lessThan(n, $.base<number>(0, []))) && $.condition(Number.MAX_SAFE_INTEGER - 270, $.greaterThan(n, $.base<number>(-1, []))))
  {
    return $.base<number>(0, []);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 271, $.isInteger(n))))
  {
    return n;
  }

  return $.ceil(n);
}
