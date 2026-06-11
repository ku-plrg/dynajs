
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__CodePointAt } from "./AO__CodePointAt.js";

export function AO__StringToCodePoints ($ : BootStrap, string : Wrapped<string>) {
  var codePoints = [] as Wrapped<never>[];
  var size = $.length(string);
  var position = $.base<number>(0, []);
  while ($.condition(0, $.lessThan(position, size)))
  {
    var cp = AO__CodePointAt($, (string as Wrapped<string>), (position as Wrapped<number>));
    $.append(codePoints, cp["CodePoint"])
    position = $.add(position, cp["CodeUnitCount"]);
  }

  return codePoints;
}
