// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__TrimString ($ : SpecRuntime, string : Wrapped<unknown>, where : Wrapped<unknown>) {
  var str = AO__RequireObjectCoercible($, string);
  var S = AO__ToString($, (str as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 749, $.is(where, $.base<string>("start", []))))
  {
    var T = $.trim(S, true, false);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 750, $.is(where, $.base<string>("end", []))))
    {
      var T = $.trim(S, false, true);
    }
    else
    {
      var T = $.trim(S, true, true);
    }

  }

  return T;
}
