// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_includes ($ : SpecRuntime, $this : Lifted<unknown>, searchString : Lifted<unknown>, position : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 442, $.is(isRegExp, $.default<boolean>(true, [])))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Lifted<unknown>));
  var pos = AO__ToIntegerOrInfinity($, (position as Lifted<unknown>));
  var len = $.length(S);
  var start = $.clamp(pos, $.default<number>(0, []), len);
  var index = AO__StringIndexOf($, (S as Lifted<string>), (searchStr as Lifted<string>), (start as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 443, $.is(index, $.default<number>(-1, [])))))
  {
    return $.default<boolean>(false, []);
  }

  return $.default<boolean>(true, []);
}
