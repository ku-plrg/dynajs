// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__StringToCodePoints ($ : SpecRuntime, string : Wrapped<string>) {
  var codePoints = [] as Wrapped<never>[];
  var size = $.length(string);
  var position = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 628, $.lessThan(position, size)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (position as Wrapped<number>));
    $.append(codePoints, cp["CodePoint" /* TODO INTERNAL : internal access */])
    position = $.add((position as Wrapped<number>), (cp["CodeUnitCount" /* TODO INTERNAL : internal access */] as Wrapped<number>));
  }

  return codePoints;
}
