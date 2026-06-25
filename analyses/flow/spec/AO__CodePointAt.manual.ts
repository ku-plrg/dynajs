// @manual CodePointAt (ECMA-262 11.1.4)
// Generated form YETs on every surrogate test and on "the code point whose
// numeric value is the numeric value of first". `first`/`second` come from
// `$.codeUnitAt`, i.e. single code-unit strings, so we read their numeric value
// with `charCodeAt` and test the surrogate ranges directly. The surrogate-range
// branches are intentionally concrete (native `if`) — UTF-16 decoding is not a
// path constraint we track symbolically — while the values stay Lifted.
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
  var first : Lifted<string> = $.substring(string, position, $.add(position, $.default(1, [])));
  var firstUnlifted : number = $.value(first).charCodeAt(0);
  // 4. Let cp be the code point whose numeric value is the numeric value of first.
  var cp = $.default<number>(firstUnlifted, [first]);
  // 5. If first is neither a leading surrogate nor a trailing surrogate, then
  if (!(firstUnlifted >= 0xd800 && firstUnlifted <= 0xdfff)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: false }.
    return { "CodePoint": cp, "CodeUnitCount": $.default<number>(1, []), "IsUnpairedSurrogate": $.default<boolean>(false, []) };
  }
  // 6. If first is a trailing surrogate or position + 1 = size, then
  if ((firstUnlifted >= 0xdc00 && firstUnlifted <= 0xdfff) || $.value(position) + 1 === $.value(size)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: true }.
    return { "CodePoint": cp, "CodeUnitCount": $.default<number>(1, []), "IsUnpairedSurrogate": $.default<boolean>(true, []) };
  }
  // 7. Let second be the code unit at index position + 1 within string.
  var second = $.substring(string, $.add(position, $.default<number>(1, [])), $.add(position, $.default<number>(2, [])));
  var secondUnlifted : number = $.value(second).charCodeAt(0);
  // 8. If second is not a trailing surrogate, then
  if (!(secondUnlifted >= 0xdc00 && secondUnlifted <= 0xdfff)) {
    // a. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 1, [[IsUnpairedSurrogate]]: true }.
    return { "CodePoint": cp, "CodeUnitCount": $.default<number>(1, []), "IsUnpairedSurrogate": $.default<boolean>(true, []) };
  }
  // 9. Set cp to UTF16SurrogatePairToCodePoint(first, second).
  cp = AO__UTF16SurrogatePairToCodePoint($, first as Lifted<string>, second as Lifted<string>);
  // 10. Return the Record { [[CodePoint]]: cp, [[CodeUnitCount]]: 2, [[IsUnpairedSurrogate]]: false }.
  return { "CodePoint": cp, "CodeUnitCount": $.default<number>(2, []), "IsUnpairedSurrogate": $.default<boolean>(false, []) };
}
