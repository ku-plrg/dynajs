// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_substring ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, end : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var len = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 414, $.is(end, $.base<undefined>(undefined, []))))
  {
    var intEnd = len;
  }
  else
  {
    var intEnd = AO__ToIntegerOrInfinity($, (end as Wrapped<unknown>));
  }

  var finalStart = $.clamp(intStart, $.base<number>(0, []), len);
  var finalEnd = $.clamp(intEnd, $.base<number>(0, []), len);
  var from = $.min(finalStart, finalEnd);
  var to = $.max(finalStart, finalEnd);
  return $.substring(S, (from as Wrapped<number>), (to as Wrapped<number>));
}
