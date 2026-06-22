// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_at ($ : SpecRuntime, $this : Wrapped<unknown>, index : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var len = $.length(S);
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 366, $.greaterThanEqual(relativeIndex, $.base<number>(0, []))))
  {
    var k = relativeIndex;
  }
  else
  {
    var k = $.add((len as Wrapped<number>), (relativeIndex as Wrapped<number>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 367, $.lessThan(k, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 368, $.greaterThanEqual(k, len)))
  {
    return $.base<undefined>(undefined, []);
  }

  return $.substring(S, (k as Wrapped<number>), ($.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<number>));
}
