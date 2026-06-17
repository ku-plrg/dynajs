
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";

export function AO__IsConcatSpreadable ($ : SpecRuntime, O : Wrapped<unknown>) {
  if (!($.isType(O, "object")))
  {
    return $.base<boolean>(false, []);
  }

  var spreadable = AO__Get($, (O as Wrapped<unknown>), ($.base<symbol>(Symbol.isConcatSpreadable, []) as Wrapped<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 455, $.is(spreadable, $.base<undefined>(undefined, []))))
  {
    return AO__ToBoolean($, (spreadable as Wrapped<unknown>));
  }

  return AO__IsArray($, (O as Wrapped<unknown>));
}
