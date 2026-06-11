
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_includes ($ : SpecRuntime, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, position : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Wrapped<unknown>));
  if ($.is(isRegExp, $.base<boolean>(true, [])))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var pos = AO__ToIntegerOrInfinity($, (position as Wrapped<unknown>));
  var len = $.length(S);
  var start = $.clamp(pos, $.base<number>(0, []), len);
  var index = AO__StringIndexOf($, (S as Wrapped<string>), (searchStr as Wrapped<string>), (start as Wrapped<number>));
  if ($.is(index, $.base<string>("not-found", [])))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>(true, []);
}
