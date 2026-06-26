// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_normalize ($ : SpecRuntime, $this : Lifted<unknown>, form : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 444, $.is(form, $.default<undefined>(undefined, [])))))
  {
    var f = $.default<string>("NFC", []);
  }
  else
  {
    var f = AO__ToString($, (form as Lifted<unknown>));
  }

  if (!((($.value($.condition(Number.MAX_SAFE_INTEGER - 445, $.is(f, $.default<string>("NFC", [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 446, $.is(f, $.default<string>("NFD", []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 447, $.is(f, $.default<string>("NFKC", []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 448, $.is(f, $.default<string>("NFKD", []))))))
  {
    throw new RangeError;
  }

  var ns = $.default($.value(S).normalize($.value(f)), [S, f]);
  return ns;
}
