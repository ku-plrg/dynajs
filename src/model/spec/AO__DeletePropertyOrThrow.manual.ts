
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__DeletePropertyOrThrow ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>) {
  "use strict";

  const Ou = $.peek(O);
  const Pu = $.peek(P);

  // 1. Let success be ? O.[[Delete]](P).
  // @ts-ignore coerce as property key
  var success = delete Ou[Pu];
  // 2. If success is false, throw a TypeError exception.
  if (success === false) throw new TypeError();
  // 3. Return unused.
}
