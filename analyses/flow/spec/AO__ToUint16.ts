// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function AO__ToUint16 ($ : SpecRuntime, argument : Lifted<unknown>) {
  var number = AO__ToNumber($, (argument as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 772, $.isFinite(number))) || ($.value($.condition(Number.MAX_SAFE_INTEGER - 773, $.is(number, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 774, $.is(number, $.default<number>(0, []))))))
  {
    return $.default<number>(0, []);
  }

  var int = $.truncate(number);
  var int16bit = $.remainder((int as Lifted<number>), ($.exponentiate($.default<number>(2, []), $.default<number>(16, [])) as Lifted<number>));
  return int16bit;
}
