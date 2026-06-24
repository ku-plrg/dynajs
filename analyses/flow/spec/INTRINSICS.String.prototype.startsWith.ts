// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_startsWith ($ : SpecRuntime, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, position : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 464, $.is(isRegExp, $.lit<boolean>(true))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var len = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 465, $.is(position, $.lit<undefined>(undefined))))
  {
    var pos = $.lit<number>(0);
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (position as Wrapped<unknown>));
  }

  var start = $.clamp(pos, $.lit<number>(0), len);
  var searchLength = $.length(searchStr);
  if ($.condition(Number.MAX_SAFE_INTEGER - 466, $.is(searchLength, $.lit<number>(0))))
  {
    return $.lit<boolean>(true);
  }

  var end = $.add((start as Wrapped<number>), (searchLength as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 467, $.greaterThan(end, len)))
  {
    return $.lit<boolean>(false);
  }

  var substring = $.substring(S, (start as Wrapped<number>), (end as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 468, $.is(substring, searchStr)))
  {
    return $.lit<boolean>(true);
  }

  return $.lit<boolean>(false);
}
