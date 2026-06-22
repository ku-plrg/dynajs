// @manual CodePointsToString (ECMA-262 11.1.6)
// Generated form lost its loop body: "For each code point cp of text" is not
// recognized as a ForEachStep, so the whole loop collapsed to a single YET and
// the concatenation step vanished. `text` is a List of code points (numbers),
// so this is plain array iteration delegating each element to UTF16EncodeCodePoint.
import { AO__UTF16EncodeCodePoint } from "./AO__UTF16EncodeCodePoint.js";

export function AO__CodePointsToString($: SpecRuntime, text: Wrapped<unknown>): Wrapped<string> {
  // 1. Let result be the empty String.
  var result = $.base<string>("", []);
  var codePoints = text as unknown as Wrapped<unknown>[];
  // 2. For each code point cp of text, do
  for (var i = 0; i < codePoints.length; i++) {
    var cp = codePoints[i];
    // a. Set result to the string-concatenation of result and UTF16EncodeCodePoint(cp).
    result = $.concatenate(result, AO__UTF16EncodeCodePoint($, cp));
  }
  // 3. Return result.
  return result;
}
