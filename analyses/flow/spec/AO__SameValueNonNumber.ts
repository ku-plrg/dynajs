// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__SameType } from "./AO__SameType.js";
import { BigInt__equal } from "./BigInt__equal.js";

export function AO__SameValueNonNumber ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 720, $.is(x, $.default<null>(null, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 721, $.is(x, $.default<undefined>(undefined, []))))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 722, $.isType(x, "bigint")))))
  {
    return BigInt__equal($, (x as Lifted<unknown>), (y as Lifted<unknown>));
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 723, $.isType(x, "string")))))
  {
    throw new Error("YET: If _x_ and _y_ have the same length and the same code units in the same positions, return *true*; otherwise, return *false*.")
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 724, $.isType(x, "boolean")))))
  {
    throw new Error("YET: If _x_ and _y_ are both *true* or both *false*, return *true*; otherwise, return *false*.")
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 725, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
