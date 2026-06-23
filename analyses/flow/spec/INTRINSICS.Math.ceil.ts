// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_ceil ($ : SpecRuntime, $this : Wrapped<unknown>, x : Wrapped<unknown>) {
  var n = AO__ToNumber($, (x as Wrapped<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 283, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 284, $.is(n, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 285, $.is(n, $.base<number>(0, [])))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 286, $.lessThan(n, $.base<number>(0, []))) && $.condition(Number.MAX_SAFE_INTEGER - 287, $.greaterThan(n, $.base<number>(-1, []))))
  {
    return $.base<number>(0, []);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 288, $.isInteger(n))))
  {
    return n;
  }

  return $.ceil(n);
}
