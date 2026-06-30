// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_indexOf ($ : SpecRuntime, $this : Lifted<unknown>, searchString : Lifted<unknown>, position : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var searchStr = AO__ToString($, (searchString as Lifted<unknown>));
  var pos = AO__ToIntegerOrInfinity($, (position as Lifted<unknown>));
  var len = $.length(S);
  var start = $.clamp(pos, $.default<number>(0, []), len);
  var result = AO__StringIndexOf($, (S as Lifted<string>), (searchStr as Lifted<string>), (start as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 444, $.is(result, $.default<number>(-1, [])))))
  {
    return $.default<number>(-1, []);
  }

  return result;
}
