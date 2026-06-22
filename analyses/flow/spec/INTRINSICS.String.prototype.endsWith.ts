// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_endsWith ($ : SpecRuntime, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, endPosition : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 375, $.is(isRegExp, $.base<boolean>(true, []))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var len = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 376, $.is(endPosition, $.base<undefined>(undefined, []))))
  {
    var pos = len;
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (endPosition as Wrapped<unknown>));
  }

  var end = $.clamp(pos, $.base<number>(0, []), len);
  var searchLength = $.length(searchStr);
  if ($.condition(Number.MAX_SAFE_INTEGER - 377, $.is(searchLength, $.base<number>(0, []))))
  {
    return $.base<boolean>(true, []);
  }

  var start = $.subtract((end as Wrapped<number>), (searchLength as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 378, $.lessThan(start, $.base<number>(0, []))))
  {
    return $.base<boolean>(false, []);
  }

  var substring = $.substring(S, (start as Wrapped<number>), (end as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 379, $.is(substring, searchStr)))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
