// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_substr ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, length : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var size = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 503, $.is(intStart, $.default<number>(-Infinity, [])))))
  {
    intStart = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 504, $.lessThan(intStart, $.default<number>(0, [])))))
    {
      intStart = $.max($.add((size as Lifted<number>), (intStart as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      intStart = $.min(intStart, size);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 505, $.is(length, $.default<undefined>(undefined, [])))))
  {
    var intLength = size;
  }
  else
  {
    var intLength = AO__ToIntegerOrInfinity($, (length as Lifted<unknown>));
  }

  intLength = $.clamp(intLength, $.default<number>(0, []), size);
  var intEnd = $.min($.add((intStart as Lifted<number>), (intLength as Lifted<number>)), size);
  return $.substring(S, (intStart as Lifted<number>), (intEnd as Lifted<number>));
}
