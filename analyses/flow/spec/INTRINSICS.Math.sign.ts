// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_sign ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if ((($.condition(Number.MAX_SAFE_INTEGER - 313, $.isNaN(n as Lifted<number>)) || $.condition(Number.MAX_SAFE_INTEGER - 314, $.is(n, $.lit<number>(0)))) || $.condition(Number.MAX_SAFE_INTEGER - 315, $.is(n, $.lit<number>(0)))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 316, $.lessThan(n, $.lit<number>(0))))
  {
    return $.lit<number>(-1);
  }

  return $.lit<number>(1);
}
