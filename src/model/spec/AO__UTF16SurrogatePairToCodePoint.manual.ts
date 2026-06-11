// @manual UTF16SurrogatePairToCodePoint (ECMA-262 11.1.3)
// Generated form is unusable: the 0xD800/0xDC00/0x400/0x10000 literals are
// emitted as characters, so the arithmetic runs on strings. `lead`/`trail`
// arrive as single code-unit strings (the result of `$.codeUnitAt`), so we
// recover their numeric values with `charCodeAt` and apply the spec formula.
export function AO__UTF16SurrogatePairToCodePoint(
  $: SpecRuntime,
  lead: Wrapped<unknown>,
  trail: Wrapped<unknown>,
): Wrapped<number> {
  // 1. Assert: lead is a leading surrogate and trail is a trailing surrogate.
  var leadCU = String($.peek(lead)).charCodeAt(0);
  var trailCU = String($.peek(trail)).charCodeAt(0);
  // 2. Let cp be (lead - 0xD800) × 0x400 + (trail - 0xDC00) + 0x10000.
  var cp = (leadCU - 0xd800) * 0x400 + (trailCU - 0xdc00) + 0x10000;
  // 3. Return the code point cp.
  return $.base<number>(cp, [lead, trail]);
}
