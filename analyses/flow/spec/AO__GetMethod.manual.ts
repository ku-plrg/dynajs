import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__GetV } from "./AO__GetV.js";
import { AO__IsCallable } from "./AO__IsCallable.js";

export function AO__GetMethod($: SpecRuntime, V: Lifted<unknown>, P: Lifted<unknown>): Lifted<unknown> {
  // 1. Let _func_ be ? GetV(_V_, _P_).
  var func = AO__GetV($, V, P);
  // 1. If _func_ is either *undefined* or *null*, return *undefined*.
  if (func === undefined || func === null) return $.default<undefined>(undefined, []);
  // 1. If IsCallable(_func_) is *false*, throw a *TypeError* exception.
  if (AO__IsCallable($, func) === false) throw new TypeError();
  // 1. Return _func_.
  return func;
}
