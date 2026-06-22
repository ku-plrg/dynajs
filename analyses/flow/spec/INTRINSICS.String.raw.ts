// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_raw ($ : SpecRuntime, $this : Wrapped<unknown>, template : Wrapped<unknown>, ...substitutions : Wrapped<unknown>[]) {
  var substitutionCount = $.base<number>(substitutions.length, []);
  var cooked = AO__ToObject($, template);
  var literals = AO__ToObject($, AO__Get($, (cooked as Wrapped<unknown>), ($.base<string>("raw", []) as Wrapped<unknown>)));
  var literalCount = AO__LengthOfArrayLike($, (literals as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 449, $.lessThanEqual(literalCount, $.base<number>(0, []))))
  {
    return $.base<string>("", []);
  }

  var R = $.base<string>("", []);
  var nextIndex = $.base<number>(0, []);
  while (true)
  {
    var nextLiteralVal = AO__Get($, (literals as Wrapped<unknown>), (AO__ToString($, (nextIndex as Wrapped<unknown>)) as Wrapped<unknown>));
    var nextLiteral = AO__ToString($, (nextLiteralVal as Wrapped<unknown>));
    R = $.concatenate(R, nextLiteral);
    if ($.condition(Number.MAX_SAFE_INTEGER - 450, $.is($.add((nextIndex as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)), literalCount)))
    {
      return R;
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 451, $.lessThan(nextIndex, substitutionCount)))
    {
      var nextSubVal = substitutions[nextIndex];
      var nextSub = AO__ToString($, (nextSubVal as Wrapped<unknown>));
      R = $.concatenate(R, nextSub);
    }

    nextIndex = $.add((nextIndex as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

}
