// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function AO__ToUint16 ($ : SpecRuntime, argument : Wrapped<unknown>) {
  var number = AO__ToNumber($, (argument as Wrapped<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 743, $.isFinite(number)) || ($.condition(Number.MAX_SAFE_INTEGER - 744, $.is(number, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 745, $.is(number, $.lit<number>(0)))))
  {
    return $.lit<number>(0);
  }

  var int = $.truncate(number);
  var int16bit = $.remainder((int as Wrapped<number>), ($.exponentiate($.lit<number>(2), $.lit<number>(16)) as Wrapped<number>));
  return int16bit;
}
