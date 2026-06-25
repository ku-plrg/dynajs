// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_charCodeAt ($ : SpecRuntime, $this : Lifted<unknown>, pos : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var position = AO__ToIntegerOrInfinity($, (pos as Lifted<unknown>));
  var size = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 420, $.lessThan(position, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 421, $.greaterThanEqual(position, size)))
  {
    return $.lit<number>(NaN);
  }

  return $.codeUnitAt(S, position);
}
