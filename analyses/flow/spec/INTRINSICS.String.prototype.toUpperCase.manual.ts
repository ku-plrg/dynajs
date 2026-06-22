import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_toUpperCase ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var upper = $.base($.peek(S).toUpperCase(), [S]);
  var base: Wrapped<string> = $.base('', [S]);
  if ($.length(S) !== $.length(upper)) {
    return upper;
  } else {
    for (var i = 0; i < $.length(S); i++) {
      var iW = $.base(i, []);
      var iNW = $.base(i + 1, []);
      var S_i = $.substring(S, iW, iNW);
      base = $.concatenate(base, S_i);
    }
    return base;
  }
}