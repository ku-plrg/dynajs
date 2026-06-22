// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_codePointAt ($ : SpecRuntime, $this : Wrapped<unknown>, pos : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var position = AO__ToIntegerOrInfinity($, (pos as Wrapped<unknown>));
  var size = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 351, $.lessThan(position, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 352, $.greaterThanEqual(position, size)))
  {
    return $.base<undefined>(undefined, []);
  }

  var cp = AO__CodePointAt($, (S as Wrapped<string>), (position as Wrapped<number>));
  return cp["CodePoint" /* TODO INTERNAL : internal access */];
}
