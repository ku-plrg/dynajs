import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__IsCallable } from "./AO__IsCallable.js";

export function AO__Call($ : SpecRuntime, F : Lifted<unknown>, V : Lifted<unknown>, argumentsList ?: Lifted<unknown>[]): Lifted<unknown> {
  "use strict";

  // 1. If argumentsList is not present, set argumentsList to a new empty List.
  if (argumentsList === undefined) argumentsList = [];

  // 2. If IsCallable(F) is false, throw a TypeError exception.
  if (AO__IsCallable($, F) === false)
    throw new TypeError("AO__Call : F is not callable");

  // 3. Return ? F.[[Call]](V, argumentsList).
  // Delegated to the framework so a modeled builtin reached here (e.g. a regex's
  // @@match) dispatches to its model rather than running opaquely on lifted args.
  return $.apply(F, V, argumentsList);
}
