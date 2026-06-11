
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_at ($ : SpecRuntime, $this : Wrapped<unknown>, index : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var len = $.length(S);
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Wrapped<unknown>));
  if ($.condition(0, $.greaterThanEqual(relativeIndex, $.base<number>(0, []))))
  {
    var k = relativeIndex;
  }
  else
  {
    var k = $.add(len, relativeIndex);
  }

  if ($.condition(1, $.lessThan(k, $.base<number>(0, []))) || $.condition(2, $.greaterThanEqual(k, len)))
  {
    return $.base<undefined>(undefined, []);
  }

  return $.substring(S, k, $.add(k, $.base<number>(1, [])));
}
