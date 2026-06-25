// @manual UTF16EncodeCodePoint (ECMA-262 11.1.5)
// Generated form is unusable: code-point hex literals (0x10000, 0x400, 0xD800,
// 0xDC00, 0xFFFF) are emitted as their *characters* and the surrogate math runs
// on strings. The observable result is exactly `String.fromCodePoint`, which
// already encodes BMP code points as one unit and supplementary ones as a
// surrogate pair — so we defer to it and keep the value flowing through `$`.
import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__UTF16EncodeCodePoint($: SpecRuntime, cp: Lifted<unknown>): Lifted<string> {
  // 1. Assert: 0 ≤ cp ≤ 0x10FFFF.
  // 2. If cp ≤ 0xFFFF, return the code unit whose numeric value is cp.
  // 3. Let cu1 be the code unit whose numeric value is floor((cp - 0x10000) / 0x400) + 0xD800.
  // 4. Let cu2 be the code unit whose numeric value is ((cp - 0x10000) modulo 0x400) + 0xDC00.
  // 5. Return the string-concatenation of cu1 and cu2.
  return $.default(String.fromCodePoint(Number($.value(cp))), [cp]);
}
