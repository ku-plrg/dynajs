// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_concat ($ : SpecRuntime, $this : Wrapped<unknown>, ...args : Wrapped<unknown>[]) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var R = S;
  for (var next of args)
  {
    var nextString = AO__ToString($, (next as Wrapped<unknown>));
    R = $.concatenate(R, nextString);
  }

  return R;
}
