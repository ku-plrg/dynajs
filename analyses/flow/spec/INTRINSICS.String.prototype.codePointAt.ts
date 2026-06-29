// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_codePointAt ($ : SpecRuntime, $this : Lifted<unknown>, pos : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var position = AO__ToIntegerOrInfinity($, (pos as Lifted<unknown>));
  var size = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 435, $.lessThan(position, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 436, $.greaterThanEqual(position, size))))
  {
    return $.default<undefined>(undefined, []);
  }

  var cp = AO__CodePointAt($, (S as Lifted<string>), (position as Lifted<number>));
  return cp["CodePoint" /* TODO INTERNAL : internal access */];
}
