// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_anchor ($ : SpecRuntime, $this : Wrapped<unknown>, name : Wrapped<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Wrapped<unknown>), ($.lit<string>("a") as Wrapped<string>), ($.lit<string>("name") as Wrapped<string>), (name as Wrapped<unknown>));
}
