
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__SameType } from "./AO__SameType.js";

export function AO__SameValueNonNumber ($ : SpecRuntime, x : Wrapped<unknown>, y : Wrapped<unknown>) {
  if (($.condition(Number.MAX_SAFE_INTEGER - 542, $.is(x, $.base<null>(null, []))) || $.condition(Number.MAX_SAFE_INTEGER - 543, $.is(x, $.base<undefined>(undefined, [])))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "bigint")))
  {
    return BigInt__equal(x, y);
  }

  if (($.isType(x, "string")))
  {
    throw new Error("YET: If _x_ and _y_ have the same length and the same code units in the same positions, return *true*; otherwise, return *false*.")
  }

  if (($.isType(x, "boolean")))
  {
    throw new Error("YET: If _x_ and _y_ are both *true* or both *false*, return *true*; otherwise, return *false*.")
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 544, $.is(x, y)))
  {
    return $.base<boolean>(true, []);
  }
  else
  {
    return $.base<boolean>(false, []);
  }

}
