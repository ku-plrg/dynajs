// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__GetV } from "./AO__GetV.js";
import { AO__IsCallable } from "./AO__IsCallable.js";

export function AO__GetMethod ($ : SpecRuntime, V : Lifted<unknown>, P : Lifted<unknown>) {
  var func = AO__GetV($, (V as Lifted<unknown>), (P as Lifted<unknown>));
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 66, $.is(func, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 67, $.is(func, $.default<null>(null, []))))))
  {
    return $.default<undefined>(undefined, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 68, $.is(AO__IsCallable($, (func as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  return func;
}
