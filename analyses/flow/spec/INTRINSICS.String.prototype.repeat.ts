// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_repeat ($ : SpecRuntime, $this : Lifted<unknown>, count : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var n = AO__ToIntegerOrInfinity($, (count as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 461, $.lessThan(n, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 462, $.is(n, $.default<number>(Infinity, [])))))
  {
    throw new RangeError;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 463, $.is(n, $.default<number>(0, [])))))
  {
    return $.default<string>("", []);
  }

  return (Array($.value(n)).fill(S) as Lifted<string>[]).reduce((a, b) => $.concatenate(a, b));
}
