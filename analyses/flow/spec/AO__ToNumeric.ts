// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToPrimitive } from "./AO__ToPrimitive.js";

export function AO__ToNumeric ($ : SpecRuntime, value : Lifted<unknown>) {
  var primValue = AO__ToPrimitive($, (value as Lifted<unknown>), ($.default<string>("number", []) as Lifted<unknown>));
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 816, $.isType(primValue, "bigint")))))
  {
    return primValue;
  }

  return AO__ToNumber($, (primValue as Lifted<unknown>));
}
