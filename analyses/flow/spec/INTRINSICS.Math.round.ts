// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_round ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 307, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 308, $.isInteger(n))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 309, $.lessThan(n, $.lit<number>(0.5))) && $.condition(Number.MAX_SAFE_INTEGER - 310, $.greaterThan(n, $.lit<number>(0))))
  {
    return $.lit<number>(0);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 311, $.lessThan(n, $.lit<number>(0))) && $.condition(Number.MAX_SAFE_INTEGER - 312, $.greaterThanEqual(n, $.lit<number>(-0.5))))
  {
    return $.lit<number>(0);
  }

  return $.round(n);
}
