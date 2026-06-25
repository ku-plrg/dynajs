// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";

export function AO__IsConcatSpreadable ($ : SpecRuntime, O : Lifted<unknown>) {
  if (!($.condition(Number.MAX_SAFE_INTEGER - 549, $.isType(O, "object"))))
  {
    return $.lit<boolean>(false);
  }

  var spreadable = AO__Get($, (O as Lifted<unknown>), ($.lit<symbol>(Symbol.isConcatSpreadable) as Lifted<unknown>));
  if (!$.condition(Number.MAX_SAFE_INTEGER - 550, $.is(spreadable, $.lit<undefined>(undefined))))
  {
    return AO__ToBoolean($, (spreadable as Lifted<unknown>));
  }

  return AO__IsArray($, (O as Lifted<unknown>));
}
