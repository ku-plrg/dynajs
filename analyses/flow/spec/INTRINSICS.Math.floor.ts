// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_floor ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 293, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 294, $.is(n, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 295, $.is(n, $.lit<number>(0)))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 296, $.lessThan(n, $.lit<number>(1))) && $.condition(Number.MAX_SAFE_INTEGER - 297, $.greaterThan(n, $.lit<number>(0))))
  {
    return $.lit<number>(0);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 298, $.isInteger(n))))
  {
    return n;
  }

  return $.floor(n);
}
