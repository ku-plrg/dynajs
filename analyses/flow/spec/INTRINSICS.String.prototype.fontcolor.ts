// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_fontcolor ($ : SpecRuntime, $this : Lifted<unknown>, colour : Lifted<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Lifted<unknown>), ($.default<string>("font", []) as Lifted<string>), ($.default<string>("color", []) as Lifted<string>), (colour as Lifted<unknown>));
}
