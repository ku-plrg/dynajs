// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CreateHTML ($ : SpecRuntime, string : Lifted<unknown>, tag : Lifted<string>, attribute : Lifted<string>, value : Lifted<unknown>) {
  var str = AO__RequireObjectCoercible($, string);
  var S = AO__ToString($, (str as Lifted<unknown>));
  var p1 = $.concatenate($.default<string>("<", []), tag);
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 29, $.is(attribute, $.default<string>("", [])))))
  {
    var V = AO__ToString($, (value as Lifted<unknown>));
    var escapedV = $.default($.value(V).replaceAll(String.fromCharCode(0x22), "&quot;"), [V]);
    p1 = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate(p1, $.default<string>(" ", [])), attribute), $.default<string>("=", [])), $.default<string>(String.fromCharCode(0x22), [])), escapedV), $.default<string>(String.fromCharCode(0x22), []));
  }

  var p2 = $.concatenate(p1, $.default<string>(">", []));
  var p3 = $.concatenate(p2, S);
  var p4 = $.concatenate($.concatenate($.concatenate(p3, $.default<string>("</", [])), tag), $.default<string>(">", []));
  return p4;
}
