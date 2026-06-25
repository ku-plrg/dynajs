import type { SpecRuntime, Lifted, Unwrapped, Primitive } from "../type.js";

export function AO__Get ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>): Lifted<unknown> {
  // 1. Return ? O.[[Get]](P, O).
  // @ts-ignore $.peek(P) can be used as key. --- IGNORE ---
  return $.base($.peek(O)[$.peek(P)], [O, P]);
}
