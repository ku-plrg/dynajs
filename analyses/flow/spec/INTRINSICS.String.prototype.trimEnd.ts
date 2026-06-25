// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trimEnd ($ : SpecRuntime, $this : Lifted<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Lifted<unknown>), ($.lit<string>("end") as Lifted<unknown>));
}
