
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_normalize ($ : BootStrap, $this : Wrapped<unknown>, form? : Wrapped<unknown>) {
  var form = arguments.length > 0 ? arguments[0] : undefined;
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  if ($.is(form, $.base<undefined>(undefined, [])))
  {
    var f = $.base<string>("NFC", []);
  }
  else
  {
    var f = AO__ToString($, (form as Wrapped<unknown>));
  }

  if (!((($.is(f, $.base<string>("NFC", [])) || $.is(f, $.base<string>("NFD", []))) || $.is(f, $.base<string>("NFKC", []))) || $.is(f, $.base<string>("NFKD", []))))
  {
    throw new RangeError;
  }

  throw new Error("YET: Let _ns_ be the String value that is the result of normalizing _S_ into the normalization form named by _f_ as specified in <a href=\"https://www.unicode.org/versions/latest/ch03.pdf\">the latest Unicode Standard, Normalization Forms</a>.")
  return ns;
}
