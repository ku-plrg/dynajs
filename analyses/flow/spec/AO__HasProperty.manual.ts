import type { Lifted, SpecRuntime } from "../type.js";

export function AO__HasProperty ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>): Lifted<boolean> {
  "use strict";

  const o = $.value(O);
  const p = $.value(P);

  // 1. Return ? O.[[HasProperty]](P).
  // @ts-ignore coerce as property key
  return $.default(p in o, [O, P]);
}
