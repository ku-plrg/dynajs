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
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 473, $.is(intStart, $.default<number>(-Infinity, [])))))
  {
    var from = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 474, $.lessThan(intStart, $.default<number>(0, [])))))
    {
      var from = $.max($.add((len as Lifted<number>), (intStart as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var from = $.min(intStart, len);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 475, $.is(end, $.default<undefined>(undefined, [])))))
  {
    var intEnd = len;
  }
  else
  {
    var intEnd = AO__ToIntegerOrInfinity($, (end as Lifted<unknown>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 476, $.is(intEnd, $.default<number>(-Infinity, [])))))
  {
    var to = $.default<number>(0, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 477, $.lessThan(intEnd, $.default<number>(0, [])))))
    {
      var to = $.max($.add((len as Lifted<number>), (intEnd as Lifted<number>)), $.default<number>(0, []));
    }
    else
    {
      var to = $.min(intEnd, len);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 478, $.greaterThanEqual(from, to))))
  {
    return $.default<string>("", []);
  }

  return $.substring(S, (from as Lifted<number>), (to as Lifted<number>));
}
