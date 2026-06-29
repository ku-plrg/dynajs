// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_substring ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, end : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var len = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 506, $.is(end, $.default<undefined>(undefined, [])))))
  {
    var intEnd = len;
  }
  else
  {
    var intEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  var finalStart = $.clamp(intStart, $.default<number>(0, []), len);
  var finalEnd = $.clamp(intEnd, $.default<number>(0, []), len);
  var from = $.min(finalStart, finalEnd);
  var to = $.max(finalStart, finalEnd);
  return $.substring(S, (from as Lifted<number>), (to as Lifted<number>));
}
