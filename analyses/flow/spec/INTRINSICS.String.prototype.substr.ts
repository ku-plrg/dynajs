// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_substr ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, length : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var size = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 488, $.is(intStart, $.lit<number>(-Infinity))))
  {
    intStart = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 489, $.lessThan(intStart, $.lit<number>(0))))
    {
      intStart = $.max($.add((size as Wrapped<number>), (intStart as Wrapped<number>)), $.lit<number>(0));
    }
    else
    {
      intStart = $.min(intStart, size);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 490, $.is(length, $.lit<undefined>(undefined))))
  {
    var intLength = size;
  }
  else
  {
    var intLength = AO__ToIntegerOrInfinity($, (length as Wrapped<unknown>));
  }

  intLength = $.clamp(intLength, $.lit<number>(0), size);
  var intEnd = $.min($.add((intStart as Wrapped<number>), (intLength as Wrapped<number>)), size);
  return $.substring(S, (intStart as Wrapped<number>), (intEnd as Wrapped<number>));
}
