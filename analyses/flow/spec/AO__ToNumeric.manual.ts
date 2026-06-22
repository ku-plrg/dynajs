import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

import { AO__ToNumber } from './AO__ToNumber.js';
import { AO__ToPrimitive } from './AO__ToPrimitive.js';

export function AO__ToNumeric($: SpecRuntime, arg: Wrapped<unknown>): Wrapped<number | bigint> {
  // 1. Let primValue be ? ToPrimitive(value, number).
  const primValue = AO__ToPrimitive($, arg, $.base('number', []));
  // 2. If primValue is a BigInt, return primValue.
  if ($.isType(primValue, 'bigint')) {
    return primValue as Wrapped<bigint>;
  }
  // 3. Return ? ToNumber(primValue).
  return AO__ToNumber($, primValue);
}
