
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__StringPad } from "./AO__StringPad.js";
import { AO__ToLength } from "./AO__ToLength.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__StringPaddingBuiltinsImpl ($ : SpecRuntime, O : Wrapped<unknown>, maxLength : Wrapped<unknown>, fillString : Wrapped<unknown>, placement : Wrapped<unknown>) {
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var intMaxLength = AO__ToLength($, (maxLength as Wrapped<unknown>));
  var stringLength = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 594, $.lessThanEqual(intMaxLength, stringLength)))
  {
    return S;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 595, $.is(fillString, $.base<undefined>(undefined, []))))
  {
    fillString = $.base<string>(" ", []);
  }
  else
  {
    fillString = AO__ToString($, (fillString as Wrapped<unknown>));
  }

  return AO__StringPad($, (S as Wrapped<string>), (intMaxLength as Wrapped<number>), (fillString as Wrapped<string>), (placement as Wrapped<unknown>));
}
