// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_localeCompare ($ : SpecRuntime, $this : Lifted<unknown>, that : Lifted<unknown>, reserved1 : Lifted<unknown> = $.default<undefined>(undefined, []), reserved2 : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  var S = AO__ToString($, (O as Lifted<unknown>));
  var thatValue = AO__ToString($, (that as Lifted<unknown>));
}
