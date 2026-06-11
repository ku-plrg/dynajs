
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringPaddingBuiltinsImpl } from "./AO__StringPaddingBuiltinsImpl.js";

export function INTRINSICS_String_prototype_padEnd ($ : BootStrap, $this : Wrapped<unknown>, maxLength : Wrapped<unknown>, fillString? : Wrapped<unknown>) {
  var fillString = arguments.length > 1 ? arguments[1] : undefined;
  var O = AO__RequireObjectCoercible($, $this);
  return AO__StringPaddingBuiltinsImpl($, (O as Wrapped<unknown>), (maxLength as Wrapped<unknown>), (fillString as Wrapped<unknown>), ($.base<string>("end", []) as Wrapped<unknown>));
}
