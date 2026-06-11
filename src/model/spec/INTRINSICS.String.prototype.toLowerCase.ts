
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__CodePointsToString } from "./AO__CodePointsToString.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringToCodePoints } from "./AO__StringToCodePoints.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_toLowerCase ($ : BootStrap, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var sText = AO__StringToCodePoints($, (S as Wrapped<string>));
  throw new Error("YET: Let _lowerText_ be toLowercase(_sText_), according to the Unicode Default Case Conversion algorithm.")
  var L = AO__CodePointsToString($, (lowerText as Wrapped<unknown>));
  return L;
}
