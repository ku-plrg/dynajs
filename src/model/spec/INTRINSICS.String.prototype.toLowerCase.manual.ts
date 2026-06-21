import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_toLowerCase ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var lower = $.base($.peek(S).toLowerCase(), [S]);
  var base: Wrapped<string> = $.base('', [S]);
  if ($.length(S) !== $.length(lower)) {
    return lower;
  } else {
    for (var i = 0; i < $.length(S); i++) {
      var iW = $.base(i, []);
      var iNW = $.base(i + 1, []);
      var S_i = $.substring(S, iW, iNW);
      base = $.concatenate(base, S_i);
  }
  return base;
}
