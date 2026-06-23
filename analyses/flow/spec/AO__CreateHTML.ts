// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CreateHTML ($ : SpecRuntime, string : Wrapped<unknown>, tag : Wrapped<string>, attribute : Wrapped<string>, value : Wrapped<unknown>) {
  var str = AO__RequireObjectCoercible($, string);
  var S = AO__ToString($, (str as Wrapped<unknown>));
  var p1 = $.concatenate($.base<string>("<", []), tag);
  if (!$.condition(Number.MAX_SAFE_INTEGER - 26, $.is(attribute, $.base<string>("", []))))
  {
    var V = AO__ToString($, (value as Wrapped<unknown>));
    var escapedV = $.base($.peek(V).replaceAll(String.fromCharCode(0x22), "&quot;"), [V]);
    p1 = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate(p1, $.base<string>(" ", [])), attribute), $.base<string>("=", [])), $.base<string>(String.fromCharCode(0x22), [])), escapedV), $.base<string>(String.fromCharCode(0x22), []));
  }

  var p2 = $.concatenate(p1, $.base<string>(">", []));
  var p3 = $.concatenate(p2, S);
  var p4 = $.concatenate($.concatenate($.concatenate(p3, $.base<string>("</", [])), tag), $.base<string>(">", []));
  return p4;
}
