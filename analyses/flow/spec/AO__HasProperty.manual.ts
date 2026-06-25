
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__HasProperty ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>): Lifted<boolean> {
  "use strict";

  const o = $.peek(O);
  const p = $.peek(P);

  // 1. Return ? O.[[HasProperty]](P).
  // @ts-ignore coerce as property key
  return $.base(p in o, [O, P]);
}
