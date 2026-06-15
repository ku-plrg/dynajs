
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Wrapped<string>) {
  var len = $.length(string);
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 116, $.lessThan(k, len)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (k as Wrapped<number>));
    if ($.is(cp["IsUnpairedSurrogate"], $.base<boolean>(true, [])))
    {
      return $.base<boolean>(false, []);
    }

    k = $.add(k, cp["CodeUnitCount"]);
  }

  return $.base<boolean>(true, []);
}
