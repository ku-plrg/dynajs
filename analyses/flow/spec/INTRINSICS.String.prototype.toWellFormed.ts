// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function INTRINSICS_String_prototype_toWellFormed ($ : SpecRuntime, $this : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var strLen = $.length(S);
  var k = $.default<number>(0, []);
  var result = $.default<string>("", []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 507, $.lessThan(k, strLen))))
  {
    var cp = AO__CodePointAt($, (S as Lifted<string>), (k as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 508, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.default<boolean>(true, [])))))
    {
      result = $.concatenate(result, $.default<string>("�", []));
    }
    else
    {
      result = $.concatenate(result, AO__UTF16EncodeCodePoint($, (cp["CodePoint" /* TODO INTERNAL : internal access */] as Lifted<unknown>)));
    }

    k = $.add((k as Lifted<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Lifted<number>));
  }

  return result;
}
