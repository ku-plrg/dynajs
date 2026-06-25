import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_toUpperCase ($ : SpecRuntime, $this : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  // The spec's code-point case mapping has no symbolic encoding (z3 has no case
  // operator); $.toUpper carries the concrete fold and the analysis's case model.
  return $.toUpper(S);
}