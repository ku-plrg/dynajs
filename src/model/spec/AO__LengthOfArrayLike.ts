
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__ToLength } from "./AO__ToLength.js";

export function AO__LengthOfArrayLike ($ : SpecRuntime, obj : Wrapped<unknown>) {
  return AO__ToLength($, (AO__Get($, (obj as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>)) as Wrapped<unknown>));
}
