// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";

export function AO__IteratorComplete ($ : SpecRuntime, iteratorResult : Lifted<unknown>) {
  return AO__ToBoolean($, (AO__Get($, (iteratorResult as Lifted<unknown>), ($.default<string>("done", []) as Lifted<unknown>)) as Lifted<unknown>));
}
