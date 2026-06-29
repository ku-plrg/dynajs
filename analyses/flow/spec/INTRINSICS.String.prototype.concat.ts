// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_concat ($ : SpecRuntime, $this : Lifted<unknown>, ...args : Lifted<unknown>[]) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var R = S;
  for (var next of args)
  {
    var nextString = AO__ToString($, (next as Lifted<unknown>));
    R = $.concatenate(R, nextString);
  }

  return R;
}
