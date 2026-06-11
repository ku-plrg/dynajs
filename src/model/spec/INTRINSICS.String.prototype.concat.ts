
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_concat ($ : BootStrap, $this : Wrapped<unknown>, ...args : Wrapped<unknown>[]) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var R = S;
  for (var _x0 = 0; _x0 < args.length; _x0++)
  {
    var next = args[_x0];
    var nextString = AO__ToString($, (next as Wrapped<unknown>));
    R = $.concatenate(R, nextString);
  }

  return R;
}
