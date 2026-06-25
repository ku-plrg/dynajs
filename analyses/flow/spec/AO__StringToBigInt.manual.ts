import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__StringToBigInt ($ : SpecRuntime, string : Lifted<string>): Lifted<bigint> {
  return $.default(BigInt($.value(string)), [string]);
}