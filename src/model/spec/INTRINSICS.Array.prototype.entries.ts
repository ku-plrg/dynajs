
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CreateArrayIterator } from "./AO__CreateArrayIterator.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_entries ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  return AO__CreateArrayIterator($, (O as Wrapped<unknown>), ($.base<string>("key+value", []) as Wrapped<unknown>));
}
