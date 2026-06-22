// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trimEnd ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Wrapped<unknown>), ($.base<string>("end", []) as Wrapped<unknown>));
}
