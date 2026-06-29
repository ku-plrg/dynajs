// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_startsWith ($ : SpecRuntime, $this : Lifted<unknown>, searchString : Lifted<unknown>, position : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 498, $.is(isRegExp, $.default<boolean>(true, [])))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Lifted<unknown>));
  var len = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 499, $.is(position, $.default<undefined>(undefined, [])))))
  {
    var pos = $.default<number>(0, []);
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (position as Lifted<unknown>));
  }

  var start = $.clamp(pos, $.default<number>(0, []), len);
  var searchLength = $.length(searchStr);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 500, $.is(searchLength, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  var end = $.add((start as Lifted<number>), (searchLength as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 501, $.greaterThan(end, len))))
  {
    return $.default<boolean>(false, []);
  }

  var substring = $.substring(S, (start as Lifted<number>), (end as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 502, $.is(substring, searchStr))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
