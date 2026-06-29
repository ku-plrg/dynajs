// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";

export function AO__GetIteratorDirect ($ : SpecRuntime, obj : Lifted<unknown>) {
  var nextMethod = AO__Get($, (obj as Lifted<unknown>), ($.default<string>("next", []) as Lifted<unknown>));
  var iteratorRecord = {"Iterator": obj, "NextMethod": nextMethod, "Done": $.default<boolean>(false, [])};
  return iteratorRecord;
}
