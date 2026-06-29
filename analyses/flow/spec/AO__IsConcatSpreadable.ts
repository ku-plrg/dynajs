// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";

export function AO__IsConcatSpreadable ($ : SpecRuntime, O : Lifted<unknown>) {
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 564, $.isType(O, "object")))))
  {
    return $.default<boolean>(false, []);
  }

  var spreadable = AO__Get($, (O as Lifted<unknown>), ($.default<symbol>(Symbol.isConcatSpreadable, []) as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 565, $.is(spreadable, $.default<undefined>(undefined, [])))))
  {
    return AO__ToBoolean($, (spreadable as Lifted<unknown>));
  }

  return AO__IsArray($, (O as Lifted<unknown>));
}
