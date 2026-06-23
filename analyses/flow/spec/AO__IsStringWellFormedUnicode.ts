// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Wrapped<string>) {
  var len = $.length(string);
  var k = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 560, $.lessThan(k, len)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (k as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 561, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.lit<boolean>(true))))
    {
      return $.lit<boolean>(false);
    }

    k = $.add((k as Wrapped<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Wrapped<number>));
  }

  return $.lit<boolean>(true);
}
