
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Wrapped<string>) {
  var len = $.length(string);
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 485, $.lessThan(k, len)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (k as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 486, $.is(cp["IsUnpairedSurrogate"], $.base<boolean>(true, []))))
    {
      return $.base<boolean>(false, []);
    }

    k = $.add((k as Wrapped<number>), (cp["CodeUnitCount"] as Wrapped<number>));
  }

  return $.base<boolean>(true, []);
}
