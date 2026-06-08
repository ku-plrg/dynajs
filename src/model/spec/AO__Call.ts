// @manual

import { AO__IsCallable } from "./AO__IsCallable.js";

export function AO__Call($ : BootStrap, F : Wrapped<unknown>, V : Wrapped<unknown>, argumentsList ?: Wrapped<unknown>[]) {
  "use strict";

  // 1. If argumentsList is not present, set argumentsList to a new empty List.
  if (argumentsList === undefined) argumentsList = [];

  // 2. If IsCallable(F) is false, throw a TypeError exception.
  if (AO__IsCallable($, F) === false)
    throw new TypeError("AO__Call : F is not callable");

  // 3. Return ? F.[[Call]](V, argumentsList).
  // TODO hook this as invokeFun?
  // @ts-ignore F can be called in this path condition.
  return $.base($.peek(F).call(V, ...argumentsList), [F, V, ...argumentsList]);
}
