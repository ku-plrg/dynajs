// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_charAt ($ : SpecRuntime, $this : Lifted<unknown>, pos : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var position = AO__ToIntegerOrInfinity($, (pos as Lifted<unknown>));
  var size = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 431, $.lessThan(position, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 432, $.greaterThanEqual(position, size))))
  {
    return $.default<string>("", []);
  }

  return $.substring(S, (position as Lifted<number>), ($.add((position as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<number>));
}
