// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_raw ($ : SpecRuntime, $this : Lifted<unknown>, template : Lifted<unknown>, ...substitutions : Lifted<unknown>[]) {
  var substitutionCount = $.default<number>(substitutions.length, []);
  var cooked = AO__ToObject($, template);
  var literals = AO__ToObject($, AO__Get($, (cooked as Lifted<unknown>), ($.default<string>("raw", []) as Lifted<unknown>)));
  var literalCount = AO__LengthOfArrayLike($, (literals as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 510, $.lessThanEqual(literalCount, $.default<number>(0, [])))))
  {
    return $.default<string>("", []);
  }

  var R = $.default<string>("", []);
  var nextIndex = $.default<number>(0, []);
  while (true)
  {
    var nextLiteralVal = AO__Get($, (literals as Lifted<unknown>), (AO__ToString($, (nextIndex as Lifted<unknown>)) as Lifted<unknown>));
    var nextLiteral = AO__ToString($, (nextLiteralVal as Lifted<unknown>));
    R = $.concatenate(R, nextLiteral);
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 511, $.is($.add((nextIndex as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)), literalCount))))
    {
      return R;
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 512, $.lessThan(nextIndex, substitutionCount))))
    {
      var nextSubVal = substitutions[nextIndex];
      var nextSub = AO__ToString($, (nextSubVal as Lifted<unknown>));
      R = $.concatenate(R, nextSub);
    }

    nextIndex = $.add((nextIndex as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

}
