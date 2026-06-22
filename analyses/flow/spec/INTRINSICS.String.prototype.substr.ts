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
  if ($.condition(Number.MAX_SAFE_INTEGER - 438, $.is(intStart, $.base<number>(-Infinity, []))))
  {
    intStart = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 439, $.lessThan(intStart, $.base<number>(0, []))))
    {
      intStart = $.max($.add((size as Wrapped<number>), (intStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      intStart = $.min(intStart, size);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 440, $.is(length, $.base<undefined>(undefined, []))))
  {
    var intLength = size;
  }
  else
  {
    var intLength = AO__ToIntegerOrInfinity($, (length as Wrapped<unknown>));
  }

  intLength = $.clamp(intLength, $.base<number>(0, []), size);
  var intEnd = $.min($.add((intStart as Wrapped<number>), (intLength as Wrapped<number>)), size);
  return $.substring(S, (intStart as Wrapped<number>), (intEnd as Wrapped<number>));
}
