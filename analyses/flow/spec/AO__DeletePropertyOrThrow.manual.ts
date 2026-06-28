import type { Lifted, SpecRuntime } from "../type.js";

export function AO__DeletePropertyOrThrow ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>) {
  "use strict";

  const Ou = $.value(O);
  const Pu = $.value(P);

  // 1. Let success be ? O.[[Delete]](P).
  // @ts-ignore coerce as property key
  var success = delete Ou[Pu];
  // 2. If success is false, throw a TypeError exception.
  if (success === false) throw new TypeError();
  // 3. Return unused.
}
