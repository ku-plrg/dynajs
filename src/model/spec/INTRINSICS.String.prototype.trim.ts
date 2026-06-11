
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trim ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Wrapped<unknown>), ($.base<string>("start+end", []) as Wrapped<unknown>));
}
