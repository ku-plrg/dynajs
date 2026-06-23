// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_fontsize ($ : SpecRuntime, $this : Wrapped<unknown>, size : Wrapped<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Wrapped<unknown>), ($.lit<string>("font") as Wrapped<string>), ($.lit<string>("size") as Wrapped<string>), (size as Wrapped<unknown>));
}
