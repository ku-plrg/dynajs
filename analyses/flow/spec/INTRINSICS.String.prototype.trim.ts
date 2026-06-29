// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__TrimString } from "./AO__TrimString.js";

export function INTRINSICS_String_prototype_trim ($ : SpecRuntime, $this : Lifted<unknown>) {
  var S = $this;
  return AO__TrimString($, (S as Lifted<unknown>), ($.default<string>("start+end", []) as Lifted<unknown>));
}
