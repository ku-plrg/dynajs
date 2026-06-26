// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_floor ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 294, $.isFinite(n))) || ($.value($.condition(Number.MAX_SAFE_INTEGER - 295, $.is(n, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 296, $.is(n, $.default<number>(0, []))))))
  {
    return n;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 297, $.lessThan(n, $.default<number>(1, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 298, $.greaterThan(n, $.default<number>(0, [])))))
  {
    return $.default<number>(0, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 299, $.isInteger(n)))))
  {
    return n;
  }

  return $.floor(n);
}
