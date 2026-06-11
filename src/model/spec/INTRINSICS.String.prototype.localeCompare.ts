
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_localeCompare ($ : BootStrap, $this : Wrapped<unknown>, that : Wrapped<unknown>, reserved1? : Wrapped<unknown>, reserved2? : Wrapped<unknown>) {
  var reserved1 = arguments.length > 1 ? arguments[1] : undefined;
  var reserved2 = arguments.length > 2 ? arguments[2] : undefined;
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Wrapped<unknown>));
  var thatValue = AO__ToString($, (that as Wrapped<unknown>));
}
