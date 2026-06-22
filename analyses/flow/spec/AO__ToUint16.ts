// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function AO__ToUint16 ($ : SpecRuntime, argument : Wrapped<unknown>) {
  var number = AO__ToNumber($, (argument as Wrapped<unknown>));
  if (!$.isFinite(number) || ($.condition(Number.MAX_SAFE_INTEGER - 651, $.is(number, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 652, $.is(number, $.base<number>(0, [])))))
  {
    return $.base<number>(0, []);
  }

  var int = $.truncate(number);
  var int16bit = $.remainder((int as Wrapped<number>), ($.exponentiate($.base<number>(2, []), $.base<number>(16, [])) as Wrapped<number>));
  return int16bit;
}
