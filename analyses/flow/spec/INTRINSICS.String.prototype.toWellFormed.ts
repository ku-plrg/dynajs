// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_prototype_toWellFormed ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var strLen = $.length(S);
  var k = $.lit<number>(0);
  var result = $.lit<string>("");
  while ($.condition(Number.MAX_SAFE_INTEGER - 469, $.lessThan(k, strLen)))
  {
    var cp = AO__CodePointAt($, (S as Wrapped<string>), (k as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 470, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.lit<boolean>(true))))
    {
      result = $.concatenate(result, $.lit<string>("�"));
    }
    else
    {
      result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (cp["CodePoint" /* TODO INTERNAL : internal access */] as Wrapped<unknown>)));
    }

    k = $.add((k as Wrapped<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Wrapped<number>));
  }

  return result;
}
