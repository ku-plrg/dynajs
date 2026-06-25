// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_at ($ : SpecRuntime, $this : Lifted<unknown>, index : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var len = $.length(S);
  var relativeIndex = AO__ToIntegerOrInfinity($, (index as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 415, $.greaterThanEqual(relativeIndex, $.lit<number>(0))))
  {
    var k = relativeIndex;
  }
  else
  {
    var k = $.add((len as Lifted<number>), (relativeIndex as Lifted<number>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 416, $.lessThan(k, $.lit<number>(0))) || $.condition(Number.MAX_SAFE_INTEGER - 417, $.greaterThanEqual(k, len)))
  {
    return $.lit<undefined>(undefined);
  }

  return $.substring(S, (k as Lifted<number>), ($.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<number>));
}
