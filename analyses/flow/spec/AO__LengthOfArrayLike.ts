// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__ToLength } from "./AO__ToLength.js";

export function AO__LengthOfArrayLike ($ : SpecRuntime, obj : Lifted<unknown>) {
  return AO__ToLength($, (AO__Get($, (obj as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>)) as Lifted<unknown>));
}
