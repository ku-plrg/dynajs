// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_round ($ : SpecRuntime, $this : Wrapped<unknown>, x : Wrapped<unknown>) {
  var n = AO__ToNumber($, (x as Wrapped<unknown>));
  if (!$.isFinite(n) || ($.condition(Number.MAX_SAFE_INTEGER - 277, $.isInteger(n))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 278, $.lessThan(n, $.base<number>(0.5, []))) && $.condition(Number.MAX_SAFE_INTEGER - 279, $.greaterThan(n, $.base<number>(0, []))))
  {
    return $.base<number>(0, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 280, $.lessThan(n, $.base<number>(0, []))) && $.condition(Number.MAX_SAFE_INTEGER - 281, $.greaterThanEqual(n, $.base<number>(-0.5, []))))
  {
    return $.base<number>(0, []);
  }

  return $.round(n);
}
