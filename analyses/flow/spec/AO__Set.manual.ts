import type { SpecRuntime, Lifted } from "../type.js";

export function AO__Set ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>, V : Lifted<unknown>, Throw : Lifted<boolean>) {
  "use strict";

  // 1. Let success be ? O.[[Set]](P, V, O). `$.set` performs the native write
  //    (engine-coercing the length / TypedArray slots) and notifies the analysis
  //    via setFieldInfo, so a symbolic array's length tracks the write.
  try {
    $.set(O, P, V);
  } catch (error) {
    // 2. If success is false and Throw is true, throw a TypeError exception.
    if (Throw) throw error;
  }
  // 3. Return unused.
}
