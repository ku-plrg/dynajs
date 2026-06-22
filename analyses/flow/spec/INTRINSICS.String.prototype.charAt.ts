// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_charAt ($ : SpecRuntime, $this : Wrapped<unknown>, pos : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var position = AO__ToIntegerOrInfinity($, (pos as Wrapped<unknown>));
  var size = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 347, $.lessThan(position, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 348, $.greaterThanEqual(position, size)))
  {
    return $.base<string>("", []);
  }

  return $.substring(S, (position as Wrapped<number>), ($.add((position as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<number>));
}
