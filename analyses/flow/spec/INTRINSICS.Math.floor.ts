// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_floor ($ : SpecRuntime, $this : Wrapped<unknown>, x : Wrapped<unknown>) {
  var n = AO__ToNumber($, (x as Wrapped<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 289, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 290, $.is(n, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 291, $.is(n, $.base<number>(0, [])))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 292, $.lessThan(n, $.base<number>(1, []))) && $.condition(Number.MAX_SAFE_INTEGER - 293, $.greaterThan(n, $.base<number>(0, []))))
  {
    return $.base<number>(0, []);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 294, $.isInteger(n))))
  {
    return n;
  }

  return $.floor(n);
}
