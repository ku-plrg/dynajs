// @manual CodePointAt (ECMA-262 11.1.4)
// Generated form YETs on every surrogate test and on "the code point whose
// numeric value is the numeric value of first". `first`/`second` come from
// `$.codeUnitAt`, i.e. single code-unit strings, so we read their numeric value
// with `charCodeAt` and test the surrogate ranges directly. The surrogate-range
// branches are intentionally concrete (native `if`) — UTF-16 decoding is not a
// path constraint we track symbolically — while the values stay Wrapped.
import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__UTF16SurrogatePairToCodePoint } from "./AO__UTF16SurrogatePairToCodePoint.js";

export function AO__CodePointAt(
  $: SpecRuntime,
  string: Lifted<string>,
  position: Lifted<number>,
) {
  // 1. Let size be the length of string.
  var size = $.length(string);
  // 2. Assert: position ≥ 0 and position < size.
  // 3. Let first be the code unit at index position within string.
  var first : Lifted<string> = $.substring(string, position, $.add(position, $.base(1, [])));
  var firstUnwrapped : number = $.peek(first).charCodeAt(0);
  // 4. Let cp be the code point whose numeric value is the numeric value of first.
  var cp = $.base<number>(firstUnwrapped, [first]);
  // 5. If first is neither a leading surrogate nor a trailing surrogate, then
  if (!(firstUnwrapped >= 0xd800 && firstUnwrapped <= 0xdfff)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: false }.
    return { "CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(false, []) };
  }
  // 6. If first is a trailing surrogate or position + 1 = size, then
  if ((firstUnwrapped >= 0xdc00 && firstUnwrapped <= 0xdfff) || $.peek(position) + 1 === $.peek(size)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: true }.
    return { "CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(true, []) };
  }
  // 7. Let second be the code unit at index position + 1 within string.
  var second = $.substring(string, $.add(position, $.base<number>(1, [])), $.add(position, $.base<number>(2, [])));
  var secondUnwrapped : number = $.peek(second).charCodeAt(0);
  // 8. If second is not a trailing surrogate, then
  if (!(secondUnwrapped >= 0xdc00 && secondUnwrapped <= 0xdfff)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: true }.
    return { "CodePoint": cp, "CodeUnitCount": $.base<number>(1, []), "IsUnpairedSurrogate": $.base<boolean>(true, []) };
  }
  // 9. Set cp to UTF16SurrogatePairToCodePoint(first, second).
  cp = AO__UTF16SurrogatePairToCodePoint($, first as Lifted<string>, second as Lifted<string>);
  // 10. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 2, [[IsUnpairedSurrogate]]: false }.
  return { "CodePoint": cp, "CodeUnitCount": $.base<number>(2, []), "IsUnpairedSurrogate": $.base<boolean>(false, []) };
}
