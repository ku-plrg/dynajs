import type { SpecRuntime, Lifted, Unwrapped, Primitive } from "../type.js";

export function AO__Set ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>, V : Lifted<unknown>, Throw : Lifted<boolean>) {
  "use strict";

  const Ou = $.peek(O);
  const Pu: unknown = $.peek(P);

  // in some cases engine coerces the value
  const storeRaw = ArrayBuffer.isView(Ou) || Pu === "length";

  // 1. Let success be ? O.[[Set]](P, V, O).
  try {
    // @ts-ignore coerce as property key
    Ou[Pu] = storeRaw ? $.peek(V) : V;
  } catch (error) {
    // 2. If success is false and Throw is true, throw a TypeError exception.
    if (Throw) throw error;
  }
  // 3. Return unused.
}
