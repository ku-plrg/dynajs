// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_startsWith ($ : SpecRuntime, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, position : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var isRegExp = AO__IsRegExp($, (searchString as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 415, $.is(isRegExp, $.base<boolean>(true, []))))
  {
    throw new TypeError;
  }

  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var len = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 416, $.is(position, $.base<undefined>(undefined, []))))
  {
    var pos = $.base<number>(0, []);
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (position as Wrapped<unknown>));
  }

  var start = $.clamp(pos, $.base<number>(0, []), len);
  var searchLength = $.length(searchStr);
  if ($.condition(Number.MAX_SAFE_INTEGER - 417, $.is(searchLength, $.base<number>(0, []))))
  {
    return $.base<boolean>(true, []);
  }

  var end = $.add((start as Wrapped<number>), (searchLength as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 418, $.greaterThan(end, len)))
  {
    return $.base<boolean>(false, []);
  }

  var substring = $.substring(S, (start as Wrapped<number>), (end as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 419, $.is(substring, searchStr)))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
