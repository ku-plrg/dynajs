// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_fromCodePoint ($ : SpecRuntime, $this : Wrapped<unknown>, ...codePoints : Wrapped<unknown>[]) {
  var result = $.base<string>("", []);
  for (var next of codePoints)
  {
    var nextCP = AO__ToNumber($, (next as Wrapped<unknown>));
    if (!($.peek($.isInteger(nextCP))))
    {
      throw new RangeError;
    }

    if ($.peek($.lessThan(nextCP, $.base<number>(0, []))) || $.peek($.greaterThan(nextCP, $.base<number>("￿".charCodeAt(0), []))))
    {
      throw new RangeError;
    }

    result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (nextCP as Wrapped<unknown>)));
  }

  return result;
}
