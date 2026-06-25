// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_trunc ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 317, $.isFinite(n)) || ($.condition(Number.MAX_SAFE_INTEGER - 318, $.is(n, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 319, $.is(n, $.lit<number>(0)))))
  {
    return n;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 320, $.lessThan(n, $.lit<number>(1))) && $.condition(Number.MAX_SAFE_INTEGER - 321, $.greaterThan(n, $.lit<number>(0))))
  {
    return $.lit<number>(0);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 322, $.lessThan(n, $.lit<number>(0))) && $.condition(Number.MAX_SAFE_INTEGER - 323, $.greaterThan(n, $.lit<number>(-1))))
  {
    return $.lit<number>(0);
  }

  return $.truncate(n);
}
