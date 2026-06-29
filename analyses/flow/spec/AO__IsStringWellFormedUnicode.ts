// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__IsStringWellFormedUnicode ($ : SpecRuntime, string : Lifted<string>) {
  var len = $.length(string);
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 598, $.lessThan(k, len))))
  {
    var cp = AO__CodePointAt($, (string as Lifted<string>), (k as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 599, $.is(cp["IsUnpairedSurrogate" /* TODO INTERNAL : internal access */], $.default<boolean>(true, [])))))
    {
      return $.default<boolean>(false, []);
    }

    k = $.add((k as Lifted<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Lifted<number>));
  }

  return $.default<boolean>(true, []);
}
