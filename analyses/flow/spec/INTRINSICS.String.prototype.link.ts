// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__CreateHTML } from "./AO__CreateHTML.js";

export function INTRINSICS_String_prototype_link ($ : SpecRuntime, $this : Wrapped<unknown>, url : Wrapped<unknown>) {
  var S = $this;
  return AO__CreateHTML($, (S as Wrapped<unknown>), ($.base<string>("a", []) as Wrapped<string>), ($.base<string>("href", []) as Wrapped<string>), (url as Wrapped<unknown>));
}
