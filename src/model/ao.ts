import type { SpecOps, Wrapped, Unwrapped } from "./type.js";

export class AO {
  constructor(public specOps: SpecOps) {

  }

  RequireObjectCoercible<T>(value: T): NonNullable<T> {
    if (value === null || value === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return value;
  }

  ToIntegerOrInfinity(value: Wrapped<unknown>): number {
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

  // Numeric coercions return RAW values: they feed the models' index/length
  // arithmetic and loop bounds (decision values), which must be concrete. A
  // wrapped primitive is a proxy whose `+proxy` is NaN, so wrapping these would
  // silently break every `>= 0` / `< len` / `len + i` (Wrapped<number> is
  // assignable to number, so TS won't catch it). _AO_Contract pins this policy.
  ToNumber(value: Wrapped<unknown>): number {
    // Coerce the underlying value, not the wrapper: wrapped primitives are plain
    // proxy objects, so `+wrapped` is always NaN. Peek first, then ToNumber.
    const raw = this.specOps.peek(value);
    // @ts-ignore unary plus on unknown is the spec's ToNumber coercion.
    return +raw;
  }

  // ToString returns a WRAPPED string: its result flows back into the program
  // (the coerced side of a `+` concatenation), so it must carry info.
  ToString(value: Wrapped<unknown>): Wrapped<string> {
    const raw = this.specOps.peek(value);
    if (typeof raw === 'symbol') { throw new TypeError('Cannot convert a Symbol value to a string'); }
    // Already a String: ToString is the identity. Return the original wrapped
    // value so char-level info survives — re-basing via `base` would collapse it
    // to all-or-nothing (baseInfo doesn't copy the per-char array).
    if (typeof raw === 'string') return value as Wrapped<string>;
    return this.specOps.base(String(raw), [value]);
  }

  ToUint32(value: Wrapped<unknown>): number {
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

  StringIndexOf(string: Wrapped<string>, searchValue: Wrapped<string>, fromIndex: number): number | undefined {
    // 1. Let len be the length of string.
    let len = this.specOps.peek(string).length; // ???
    // 2. If searchValue is the empty String and fromIndex ≤ len, return fromIndex.
    const empty = this.specOps.base('', []);
    const searchValueStr = this.specOps.peek(searchValue);
    if (searchValueStr === '' && fromIndex <= len) {
      return fromIndex;
    }
    // 3. Let searchLen be the length of searchValue.
    let searchLen = this.specOps.peek(searchValue).length; // ???
    // 4. For each integer i such that fromIndex ≤ i ≤ len - searchLen, in ascending order, do
    for (let i = fromIndex; i <= len - searchLen; i++) {
    //     a. Let candidate be the substring of string from i to i + searchLen.
        let candidate = this.specOps.substring(string, this.specOps.base(i, []), this.specOps.base(i + searchLen, []));
    //     b. If candidate is searchValue, return i.
        const left = this.specOps.peek(candidate);
        const right = this.specOps.peek(searchValue);
        // TODO this should be .is instead of ===?
        if (left === right) {
          return i;
        }
    }
    // 5. Return not-found.
    return undefined;
  }

  SameType(x: Wrapped<unknown>, y: Wrapped<unknown>): boolean {
    const xType = typeof this.specOps.peek(x);
    const yType = typeof this.specOps.peek(y);
    return xType === yType;
  }
}