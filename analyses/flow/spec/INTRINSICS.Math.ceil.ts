// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_ceil ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 291, $.isFinite(n))) || ($.value($.condition(Number.MAX_SAFE_INTEGER - 292, $.is(n, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 293, $.is(n, $.default<number>(0, []))))))
  {
    return n;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 294, $.lessThan(n, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 295, $.greaterThan(n, $.default<number>(-1, [])))))
  {
    return $.default<number>(0, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 296, $.isInteger(n)))))
  {
    return n;
  }

  return $.ceil(n);
}
