
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__HasProperty ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>): Wrapped<boolean> {
  "use strict";

  const o = $.peek(O);
  const p = $.peek(P);

  // 1. Return ? O.[[HasProperty]](P).
  // @ts-ignore coerce as property key
  return $.base(p in o, [O, P]);
}
