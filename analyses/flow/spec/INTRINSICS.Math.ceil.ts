// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_ceil ($ : SpecRuntime, $this : Wrapped<unknown>, x : Wrapped<unknown>) {
  var n = AO__ToNumber($, (x as Wrapped<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 287, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 288, $.is(n, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 289, $.is(n, $.lit<number>(0)))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 290, $.lessThan(n, $.lit<number>(0))) && $.condition(Number.MAX_SAFE_INTEGER - 291, $.greaterThan(n, $.lit<number>(-1))))
  {
    return $.lit<number>(0);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 292, $.isInteger(n))))
  {
    return n;
  }

  return $.ceil(n);
}
