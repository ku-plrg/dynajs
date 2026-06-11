
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trimStart ($ : BootStrap, $this : Wrapped<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Wrapped<unknown>), ($.base<string>("start", []) as Wrapped<unknown>));
}
