// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_repeat ($ : SpecRuntime, $this : Wrapped<unknown>, count : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var n = AO__ToIntegerOrInfinity($, (count as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 401, $.lessThan(n, $.base<number>(0, []))) || $.condition(Number.MAX_SAFE_INTEGER - 402, $.is(n, $.base<number>(Infinity, []))))
  {
    throw new RangeError;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 403, $.is(n, $.base<number>(0, []))))
  {
    return $.base<string>("", []);
  }

  return $.base($.peek(S).repeat($.peek(n)), [S, n]);
}
