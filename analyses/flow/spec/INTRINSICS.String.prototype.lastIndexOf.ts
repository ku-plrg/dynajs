// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringLastIndexOf } from "./AO__StringLastIndexOf.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_lastIndexOf ($ : SpecRuntime, $this : Lifted<unknown>, searchString : Lifted<unknown>, position : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var searchStr = AO__ToString($, (searchString as Lifted<unknown>));
  var numPos = AO__ToNumber($, (position as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 445, $.isNaN(numPos as Lifted<number>))))
  {
    var pos = $.default<number>(Infinity, []);
  }
  else
  {
    var pos = AO__ToIntegerOrInfinity($, (numPos as Lifted<unknown>));
  }

  var len = $.length(S);
  var searchLen = $.length(searchStr);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 446, $.lessThan(len, searchLen))))
  {
    return $.default<number>(-1, []);
  }

  var start = $.clamp(pos, $.default<number>(0, []), $.subtract((len as Lifted<number>), (searchLen as Lifted<number>)));
  var result = AO__StringLastIndexOf($, (S as Lifted<string>), (searchStr as Lifted<string>), (start as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 447, $.is(result, $.default<number>(-1, [])))))
  {
    return $.default<number>(-1, []);
  }

  return result;
}
