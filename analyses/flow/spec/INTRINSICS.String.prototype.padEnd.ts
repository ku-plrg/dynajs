// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringPaddingBuiltinsImpl } from "./AO__StringPaddingBuiltinsImpl.js";

export function INTRINSICS_String_prototype_padEnd ($ : SpecRuntime, $this : Lifted<unknown>, maxLength : Lifted<unknown>, fillString : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__RequireObjectCoercible($, $this);
  return AO__StringPaddingBuiltinsImpl($, (O as Lifted<unknown>), (maxLength as Lifted<unknown>), (fillString as Lifted<unknown>), ($.default<string>("end", []) as Lifted<unknown>));
}
