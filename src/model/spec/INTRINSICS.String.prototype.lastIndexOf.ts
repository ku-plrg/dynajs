
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringLastIndexOf } from "./AO__StringLastIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_lastIndexOf ($ : BootStrap, $this : Wrapped<unknown>, searchString : Wrapped<unknown>, position? : Wrapped<unknown>) {
  var position = arguments.length > 1 ? arguments[1] : undefined;
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var searchStr = AO__ToString($, (searchString as Wrapped<unknown>));
  var numPos = AO__ToNumber($, (position as Wrapped<unknown>));
  if ($.isNaN(numPos))
  {
    var pos = $.base<number>(Infinity, []);
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (numPos as Wrapped<unknown>));
  }

  var len = $.length(S);
  var searchLen = $.length(searchStr);
  if ($.condition(0, $.lessThan(len, searchLen)))
  {
    return $.base<number>(-1, []);
  }

  var start = $.clamp(pos, $.base<number>(0, []), $.subtract(len, searchLen));
  var result = AO__StringLastIndexOf($, (S as Wrapped<string>), (searchStr as Wrapped<string>), (start as Wrapped<number>));
  if ($.is(result, $.base<string>("not-found", [])))
  {
    return $.base<number>(-1, []);
  }

  return result;
}
