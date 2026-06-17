
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__SameType } from "./AO__SameType.js";
import { AO__SameValueNonNumber } from "./AO__SameValueNonNumber.js";

export function AO__SameValueZero ($ : SpecRuntime, x : Wrapped<unknown>, y : Wrapped<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 545, $.is(AO__SameType($, (x as Wrapped<unknown>), (y as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    return $.base<boolean>(false, []);
  }

  if (($.isType(x, "number")))
  {
    // return Number__sameValueZero(x, y);
    return x === y;
  }

  return AO__SameValueNonNumber($, (x as Wrapped<unknown>), (y as Wrapped<unknown>));
}
