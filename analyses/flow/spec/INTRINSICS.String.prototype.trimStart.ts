// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trimStart ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Wrapped<unknown>), ($.lit<string>("start") as Wrapped<unknown>));
}
