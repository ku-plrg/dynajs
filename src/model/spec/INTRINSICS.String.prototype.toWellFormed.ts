
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_prototype_toWellFormed ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var strLen = $.length(S);
  var k = $.base<number>(0, []);
  var result = $.base<string>("", []);
  while ($.condition(0, $.lessThan(k, strLen)))
  {
    var cp = AO__CodePointAt($, (S as Wrapped<string>), (k as Wrapped<number>));
    if ($.is(cp["IsUnpairedSurrogate"], $.base<boolean>(true, [])))
    {
      result = $.concatenate(result, $.base<string>("�", []));
    }
    else
    {
      result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (cp["CodePoint"] as Wrapped<unknown>)));
    }

    k = $.add(k, cp["CodeUnitCount"]);
  }

  return result;
}
