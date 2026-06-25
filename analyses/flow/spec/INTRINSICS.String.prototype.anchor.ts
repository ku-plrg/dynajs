// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_anchor ($ : SpecRuntime, $this : Lifted<unknown>, name : Lifted<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Lifted<unknown>), ($.lit<string>("a") as Lifted<string>), ($.lit<string>("name") as Lifted<string>), (name as Lifted<unknown>));
}
