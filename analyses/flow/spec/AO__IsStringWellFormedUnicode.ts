// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Wrapped<string>) {
  var len = $.length(string);
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 518, $.lessThan(k, len)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (k as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 519, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.base<boolean>(true, []))))
    {
      return $.base<boolean>(false, []);
    }

    k = $.add((k as Wrapped<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Wrapped<number>));
  }

  return $.base<boolean>(true, []);
}
