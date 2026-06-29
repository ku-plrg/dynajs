// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__TrimString ($ : SpecRuntime, string : Lifted<unknown>, where : Lifted<unknown>) {
  var str = AO__RequireObjectCoercible($, string);
  var S = AO__ToString($, (str as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 836, $.is(where, $.default<string>("start", [])))))
  {
    var T = $.trim(S, true, false);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 837, $.is(where, $.default<string>("end", [])))))
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
