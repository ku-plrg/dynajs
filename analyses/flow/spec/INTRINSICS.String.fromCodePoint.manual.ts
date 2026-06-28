import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_fromCodePoint ($ : SpecRuntime, $this : Lifted<unknown>, ...codePoints : Lifted<unknown>[]) {
  var result = $.default<string>("", []);
  for (var next of codePoints)
  {
    var nextCP = AO__ToNumber($, (next as Lifted<unknown>));
    if (!($.value($.isInteger(nextCP))))
    {
      throw new RangeError;
    }

    if ($.value($.lessThan(nextCP, $.default<number>(0, []))) || $.value($.greaterThan(nextCP, $.default<number>("￿".charCodeAt(0), []))))
    {
      throw new RangeError;
    }

    result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (nextCP as Lifted<unknown>)));
  }

  return result;
}
