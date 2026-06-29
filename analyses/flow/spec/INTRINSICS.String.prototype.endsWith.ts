// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_endsWith ($ : SpecRuntime, $this : Lifted<unknown>, searchString : Lifted<unknown>, endPosition : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 437, $.is(isRegExp, $.default<boolean>(true, [])))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Lifted<unknown>));
  var len = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 438, $.is(endPosition, $.default<undefined>(undefined, [])))))
  {
    var pos = len;
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (endPosition as Lifted<unknown>));
  }

  var end = $.clamp(pos, $.default<number>(0, []), len);
  var searchLength = $.length(searchStr);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 439, $.is(searchLength, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  var start = $.subtract((end as Lifted<number>), (searchLength as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 440, $.lessThan(start, $.default<number>(0, [])))))
  {
    return $.default<boolean>(false, []);
  }

  var substring = $.substring(S, (start as Lifted<number>), (end as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 441, $.is(substring, searchStr))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
