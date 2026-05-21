import type { SpecOps } from "./type.js";

export class AO<Str> {
  constructor(public specOps: SpecOps<Str, unknown, unknown, unknown, unknown>) {

  }

  RequireObjectCoercible<T>(value: T): NonNullable<T> {
    if (value === null || value === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return value;
  }

  ToIntegerOrInfinity(value: unknown): number {
    // 1. Let number be ? ToNumber(argument).
    const number = this.ToNumber(value);
    // 2. If number is one of NaN, +0𝔽, or -0𝔽, return 0.
    if (number !== number || number === 0) {
      return 0;
    }
    // 3. If number is +∞𝔽, return +∞.
    // 4. If number is -∞𝔽, return -∞.
    if (number === Infinity || number === -Infinity) {
      return number;
    }
    // 5. Return truncate(ℝ(number)).
    return Math.trunc(number);
  }

  ToNumber(value: unknown): number {
    // @ts-expect-error ToNumber(unknown)
    return +value;
  }

  ToString(value: unknown): string {
    if (typeof value === 'symbol') { throw new TypeError('Cannot convert a Symbol value to a string'); }
    return String(new String(value));
  }

  ToUint32(value: unknown): number {
    // 1. Let number be ? ToNumber(argument).
    let number = this.ToNumber(value);
    // 2. If number is not finite or number is either +0𝔽 or -0𝔽, return +0𝔽.
    if (number === Infinity || number === -Infinity || number === 0) {
      return 0;
    }
    // 3. Let int be truncate(ℝ(number)).
    const int = Math.trunc(number);
    // 4. Let int32bit be int modulo 2**32.
    const int32bit = int % (2 ** 32);
    // 5. Return 𝔽(int32bit).
    return int32bit;
  }

  StringIndexOf(string: Str, searchValue: Str, fromIndex: number): number | undefined {
    // 1. Let len be the length of string.
    let len = this.specOps.str.length(string);
    // 2. If searchValue is the empty String and fromIndex ≤ len, return fromIndex.
    if (this.specOps.str.is(searchValue, this.specOps.str.empty()) && fromIndex <= len) {
      return fromIndex;
    }
    // 3. Let searchLen be the length of searchValue.
    let searchLen = this.specOps.str.length(searchValue);
    // 4. For each integer i such that fromIndex ≤ i ≤ len - searchLen, in ascending order, do
    for (let i = fromIndex; i <= len - searchLen; i++) {
    //     a. Let candidate be the substring of string from i to i + searchLen.
        let candidate = this.specOps.str.substring(string, i, i + searchLen);
    //     b. If candidate is searchValue, return i.
        if (this.specOps.str.is(candidate, searchValue)) {
          return i;
        }
    }
    // 5. Return not-found.
    return undefined;
  }
}
