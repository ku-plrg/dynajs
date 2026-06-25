// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Lifted<string>) {
  var len = $.length(string);
  var k = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 583, $.lessThan(k, len)))
  {
    var cp = AO__CodePointAt($, (string as Lifted<string>), (k as Lifted<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 584, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.lit<boolean>(true))))
    {
      return $.lit<boolean>(false);
    }

    k = $.add((k as Lifted<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Lifted<number>));
  }

  return $.lit<boolean>(true);
}
