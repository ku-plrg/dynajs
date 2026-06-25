import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__CreateDataProperty ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>, V : Lifted<unknown>) {
  var newDesc = {"value": V, "writable": true, "enumerable": true, "configurable": true };
  // @ts-ignore $.value(P) can be used as key. --- IGNORE ---
  return $.default(Object.defineProperty($.value(O), $.value(P), newDesc) !== undefined, [O, P, V]);
}
