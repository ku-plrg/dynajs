// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__IsStringWellFormedUnicode } from "./AO__IsStringWellFormedUnicode.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_isWellFormed ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  return AO__IsStringWellFormedUnicode($, (S as Wrapped<string>));
}
