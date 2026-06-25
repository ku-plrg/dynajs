// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function AO__ToUint16 ($ : SpecRuntime, argument : Lifted<unknown>) {
  var number = AO__ToNumber($, (argument as Lifted<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 766, $.isFinite(number)) || ($.condition(Number.MAX_SAFE_INTEGER - 767, $.is(number, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 768, $.is(number, $.lit<number>(0)))))
  {
    return $.lit<number>(0);
  }

  var int = $.truncate(number);
  var int16bit = $.remainder((int as Lifted<number>), ($.exponentiate($.lit<number>(2), $.lit<number>(16)) as Lifted<number>));
  return int16bit;
}
