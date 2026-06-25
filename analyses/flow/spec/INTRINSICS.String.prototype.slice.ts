// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_slice ($ : SpecRuntime, $this : Lifted<unknown>, start : Lifted<unknown>, end : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var len = $.length(S);
  var intStart = AO__ToIntegerOrInfinity($, (start as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 467, $.is(intStart, $.lit<number>(-Infinity))))
  {
    var from = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 468, $.lessThan(intStart, $.lit<number>(0))))
    {
      var from = $.max($.add((len as Lifted<number>), (intStart as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var from = $.min(intStart, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 469, $.is(end, $.lit<undefined>(undefined))))
  {
    var intEnd = len;
  }
  else
  {
    var intEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 470, $.is(intEnd, $.lit<number>(-Infinity))))
  {
    var to = $.lit<number>(0);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 471, $.lessThan(intEnd, $.lit<number>(0))))
    {
      var to = $.max($.add((len as Lifted<number>), (intEnd as Lifted<number>)), $.lit<number>(0));
    }
    else
    {
      var to = $.min(intEnd, len);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 472, $.greaterThanEqual(from, to)))
  {
    return $.lit<string>("");
  }

  return $.substring(S, (from as Lifted<number>), (to as Lifted<number>));
}
