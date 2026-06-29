// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__StringPad } from "./AO__StringPad.js";
import { AO__ToLength } from "./AO__ToLength.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__StringPaddingBuiltinsImpl ($ : SpecRuntime, O : Lifted<unknown>, maxLength : Lifted<unknown>, fillString : Lifted<unknown>, placement : Lifted<unknown>) {
  var S = AO__ToString($, (O as Lifted<unknown>));
  var intMaxLength = AO__ToLength($, (maxLength as Lifted<unknown>));
  var stringLength = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 788, $.lessThanEqual(intMaxLength, stringLength))))
  {
    return S;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 789, $.is(fillString, $.default<undefined>(undefined, [])))))
  {
    fillString = $.default<string>(" ", []);
  }
  else
  {
    fillString = AO__ToString($, (fillString as Lifted<unknown>));
  }

  return AO__StringPad($, (S as Lifted<string>), (intMaxLength as Lifted<number>), (fillString as Lifted<string>), (placement as Lifted<unknown>));
}
