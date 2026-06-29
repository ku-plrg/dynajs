// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_fromCodePoint ($ : SpecRuntime, $this : Lifted<unknown>, ...codePoints : Lifted<unknown>[]) {
  var result = $.default<string>("", []);
  for (var next of codePoints)
  {
    var nextCP = AO__ToNumber($, (next as Lifted<unknown>));
    if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 425, $.isInteger(nextCP)))))
    {
      throw new RangeError;
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 426, $.lessThan(nextCP, $.default<number>(0, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 427, $.greaterThan(nextCP, $.default<string>("￿", [])))))
    {
      throw new RangeError;
    }

    result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (nextCP as Lifted<unknown>)));
  }

  return result;
}
