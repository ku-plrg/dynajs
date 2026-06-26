// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_sign ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if ((($.value($.condition(Number.MAX_SAFE_INTEGER - 317, $.isNaN(n as Lifted<number>))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 318, $.is(n, $.default<number>(0, []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 319, $.is(n, $.default<number>(0, []))))))
  {
    return n;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 320, $.lessThan(n, $.default<number>(0, [])))))
  {
    return $.default<number>(-1, []);
  }

  return $.default<number>(1, []);
}
