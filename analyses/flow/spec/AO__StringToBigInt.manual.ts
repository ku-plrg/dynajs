import type { LiftedTransfer, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToBigInt ($ : LiftedTransfer, string : Lifted<string>): Lifted<bigint> {
  return $.default(BigInt($.value(string)), [string]);
}