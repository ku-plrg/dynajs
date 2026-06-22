// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_normalize ($ : SpecRuntime, $this : Wrapped<unknown>, form : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 370, $.is(form, $.base<undefined>(undefined, []))))
  {
    var f = $.base<string>("NFC", []);
  }
  else
  {
    var f = AO__ToString($, (form as Wrapped<unknown>));
  }

  if (!((($.condition(Number.MAX_SAFE_INTEGER - 371, $.is(f, $.base<string>("NFC", []))) || $.condition(Number.MAX_SAFE_INTEGER - 372, $.is(f, $.base<string>("NFD", [])))) || $.condition(Number.MAX_SAFE_INTEGER - 373, $.is(f, $.base<string>("NFKC", [])))) || $.condition(Number.MAX_SAFE_INTEGER - 374, $.is(f, $.base<string>("NFKD", [])))))
  {
    throw new RangeError;
  }

  var ns = $.base($.peek(S).normalize($.peek(f)), [S, f]);
  return ns;
}
