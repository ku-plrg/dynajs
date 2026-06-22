// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_slice ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, end : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var len = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 421, $.is(intStart, $.base<number>(-Infinity, []))))
  {
    var from = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 422, $.lessThan(intStart, $.base<number>(0, []))))
    {
      var from = $.max($.add((len as Wrapped<number>), (intStart as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var from = $.min(intStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 423, $.is(end, $.base<undefined>(undefined, []))))
  {
    var intEnd = len;
  }
  else
  {
    var intEnd = AO__ToIntegerOrInfinity($, (end as Wrapped<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 424, $.is(intEnd, $.base<number>(-Infinity, []))))
  {
    var to = $.base<number>(0, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 425, $.lessThan(intEnd, $.base<number>(0, []))))
    {
      var to = $.max($.add((len as Wrapped<number>), (intEnd as Wrapped<number>)), $.base<number>(0, []));
    }
    else
    {
      var to = $.min(intEnd, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 426, $.greaterThanEqual(from, to)))
  {
    return $.base<string>("", []);
  }

  return $.substring(S, (from as Wrapped<number>), (to as Wrapped<number>));
}
