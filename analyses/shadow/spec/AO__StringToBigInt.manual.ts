import type { LiftedTransferOps, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToBigInt ($ : LiftedTransferOps, string : Lifted<string>): Lifted<bigint> {
  return $.default(BigInt($.value(string)), [string]);
}