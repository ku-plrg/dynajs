
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__SameType } from "./AO__SameType.js";
import { AO__SameValueNonNumber } from "./AO__SameValueNonNumber.js";

export function AO__SameValueZero ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>): Lifted<boolean> {
  if ($.condition(Number.MAX_SAFE_INTEGER - 545, $.is(AO__SameType($, (x as Lifted<unknown>), (y as Lifted<unknown>)), $.default<boolean>(false, []))))
  {
    return $.default<boolean>(false, []);
  }

  if (($.value($.isType(x, "number"))))
  {
    // return Number__sameValueZero(x, y);
    return $.default<boolean>(x === y, []);
  }

  return AO__SameValueNonNumber($, (x as Lifted<unknown>), (y as Lifted<unknown>));
}
