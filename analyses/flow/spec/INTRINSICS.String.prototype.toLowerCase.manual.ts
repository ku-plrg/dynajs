import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_toLowerCase ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var lower = $.base($.peek(S).toLowerCase(), [S]);
  var base: Wrapped<string> = $.base('', [S]);
  if ($.peek($.isNot($.length(S), $.length(lower)))) /* TODO cond */ {
    return lower;
  } else {
    for (var i = $.base<number>(0, []); i < $.length(S); i = $.add(i, $.base(1, []))) {
      var S_i = $.substring(S, i, $.add(i, $.base(1, [])));
      base = $.concatenate(base, S_i);
    }
    return base;
  }
}