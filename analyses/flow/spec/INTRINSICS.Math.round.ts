// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_round ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 307, $.isFinite(n))) || ($.value($.condition(Number.MAX_SAFE_INTEGER - 308, $.isInteger(n)))))
  {
    return n;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 309, $.lessThan(n, $.default<number>(0.5, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 310, $.greaterThan(n, $.default<number>(0, [])))))
  {
    return $.default<number>(0, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 311, $.lessThan(n, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 312, $.greaterThanEqual(n, $.default<number>(-0.5, [])))))
  {
    return $.default<number>(0, []);
  }

  return $.round(n);
}
