// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__SameType } from "./AO__SameType.js";
import { BigInt__equal } from "./BigInt__equal.js";

export function AO__SameValueNonNumber ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 729, $.is(x, $.default<null>(null, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 730, $.is(x, $.default<undefined>(undefined, []))))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 731, $.isType(x, "bigint")))))
  {
    return BigInt__equal($, (x as Lifted<bigint>), (y as Lifted<bigint>));
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 732, $.isType(x, "string")))))
  {
    return $.is(x, y);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 733, $.isType(x, "boolean")))))
  {
    return $.is(x, y);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 734, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
