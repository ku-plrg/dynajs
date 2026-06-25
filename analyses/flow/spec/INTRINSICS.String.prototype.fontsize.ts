// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_fontsize ($ : SpecRuntime, $this : Lifted<unknown>, size : Lifted<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Lifted<unknown>), ($.lit<string>("font") as Lifted<string>), ($.lit<string>("size") as Lifted<string>), (size as Lifted<unknown>));
}
