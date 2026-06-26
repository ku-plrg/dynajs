// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function INTRINSICS_Math_trunc ($ : SpecRuntime, $this : Lifted<unknown>, x : Lifted<unknown>) {
  var n = AO__ToNumber($, (x as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 321, $.isFinite(n))) || ($.value($.condition(Number.MAX_SAFE_INTEGER - 322, $.is(n, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 323, $.is(n, $.default<number>(0, []))))))
  {
    return n;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 324, $.lessThan(n, $.default<number>(1, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 325, $.greaterThan(n, $.default<number>(0, [])))))
  {
    return $.default<number>(0, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 326, $.lessThan(n, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 327, $.greaterThan(n, $.default<number>(-1, [])))))
  {
    return $.default<number>(0, []);
  }

  return $.truncate(n);
}
