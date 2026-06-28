import type { SpecRuntime, Lifted } from "../type.js";

export function AO__Get ($ : SpecRuntime, O : Lifted<Object>, P : Lifted<unknown>): Lifted<unknown> {
  // 1. Return ? O.[[Get]](P, O).
  return $.get(O, P);
}
