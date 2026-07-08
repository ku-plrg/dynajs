import type { LiftedTransferOps, Lifted } from "../type.js";

export function AO__Get ($ : LiftedTransferOps, O : Lifted<Object>, P : Lifted<unknown>): Lifted<unknown> {
  // 1. Return ? O.[[Get]](P, O).
  return $.get(O, P);
}
