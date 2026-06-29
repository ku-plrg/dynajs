// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_anchor ($ : SpecRuntime, $this : Lifted<unknown>, name : Lifted<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Lifted<unknown>), ($.default<string>("a", []) as Lifted<string>), ($.default<string>("name", []) as Lifted<string>), (name as Lifted<unknown>));
}
