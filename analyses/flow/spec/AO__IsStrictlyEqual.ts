// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__SameType } from "./AO__SameType.js";
import { AO__SameValueNonNumber } from "./AO__SameValueNonNumber.js";
import { Number__equal } from "./Number__equal.js";

export function AO__IsStrictlyEqual ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 596, $.is(AO__SameType($, (x as Lifted<unknown>), (y as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    return $.default<boolean>(false, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 597, $.isType(x, "number")))))
  {
    return Number__equal($, (x as Lifted<number>), (y as Lifted<number>));
  }

  return AO__SameValueNonNumber($, (x as Lifted<unknown>), (y as Lifted<unknown>));
}
