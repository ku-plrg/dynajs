// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_normalize ($ : SpecRuntime, $this : Lifted<unknown>, form : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 456, $.is(form, $.default<undefined>(undefined, [])))))
  {
    var f = $.default<string>("NFC", []);
  }
  else
  {
    var f = AO__ToString($, (form as Lifted<unknown>));
  }

  if (!((($.value($.condition(Number.MAX_SAFE_INTEGER - 457, $.is(f, $.default<string>("NFC", [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 458, $.is(f, $.default<string>("NFD", []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 459, $.is(f, $.default<string>("NFKC", []))))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 460, $.is(f, $.default<string>("NFKD", []))))))
  {
    throw new RangeError;
  }

  var ns = $.default($.value(S).normalize($.value(f)), [S, f]);
  return ns;
}
