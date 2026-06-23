// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_normalize ($ : SpecRuntime, $this : Wrapped<unknown>, form : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 419, $.is(form, $.lit<undefined>(undefined))))
  {
    var f = $.lit<string>("NFC");
  }
  else
  {
    var f = AO__ToString($, (form as Wrapped<unknown>));
  }

  if (!((($.condition(Number.MAX_SAFE_INTEGER - 420, $.is(f, $.lit<string>("NFC"))) || $.condition(Number.MAX_SAFE_INTEGER - 421, $.is(f, $.lit<string>("NFD")))) || $.condition(Number.MAX_SAFE_INTEGER - 422, $.is(f, $.lit<string>("NFKC")))) || $.condition(Number.MAX_SAFE_INTEGER - 423, $.is(f, $.lit<string>("NFKD")))))
  {
    throw new RangeError;
  }

  var ns = $.base($.peek(S).normalize($.peek(f)), [S, f]);
  return ns;
}
