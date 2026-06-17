// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringPaddingBuiltinsImpl } from "./AO__StringPaddingBuiltinsImpl.js";

export function INTRINSICS_String_prototype_padStart ($ : SpecRuntime, $this : Wrapped<unknown>, maxLength : Wrapped<unknown>, fillString : Wrapped<unknown> = $.undef) {
  var O = AO__RequireObjectCoercible($, $this);
  return AO__StringPaddingBuiltinsImpl($, (O as Wrapped<unknown>), (maxLength as Wrapped<unknown>), (fillString as Wrapped<unknown>), ($.base<string>("start", []) as Wrapped<unknown>));
}
