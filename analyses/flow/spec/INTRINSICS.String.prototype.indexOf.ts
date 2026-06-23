// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_indexOf ($ : SpecRuntime, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, position : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var pos = AO__ToIntegerOrInfinity($, (position as Wrapped<unknown>));
  var len = $.length(S);
  var start = $.clamp(pos, $.base<number>(0, []), len);
  var result = AO__StringIndexOf($, (S as Wrapped<string>), (searchStr as Wrapped<string>), (start as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 408, $.is(result, $.base<string>("not-found", []))))
  {
    return $.base<number>(-1, []);
  }

  return result;
}
