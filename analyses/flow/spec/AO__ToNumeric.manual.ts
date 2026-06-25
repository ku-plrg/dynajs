import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__ToNumber } from './AO__ToNumber.js';
import { AO__ToPrimitive } from './AO__ToPrimitive.js';

export function AO__ToNumeric($: SpecRuntime, arg: Lifted<unknown>): Lifted<number | bigint> {
  // 1. Let primValue be ? ToPrimitive(value, number).
  const primValue = AO__ToPrimitive($, arg, $.base('number', []));
  // 2. If primValue is a BigInt, return primValue.
  if ($.peek($.isType(primValue, 'bigint'))) {
    return primValue as Lifted<bigint>;
  }
  // 3. Return ? ToNumber(primValue).
  return AO__ToNumber($, primValue);
}
