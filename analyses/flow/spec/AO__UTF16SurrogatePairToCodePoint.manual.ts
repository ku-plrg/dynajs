export function AO__UTF16SurrogatePairToCodePoint(
  $: SpecRuntime,
  lead: Wrapped<string>,
  trail: Wrapped<string>,
): Wrapped<number> {
  // 1. Assert: lead is a leading surrogate and trail is a trailing surrogate.
  var leadCU = $.peek(lead).charCodeAt(0);
  var trailCU = $.peek(trail).charCodeAt(0);
  // 2. Let cp be (lead - 0xD800) × 0x400 + (trail - 0xDC00) + 0x10000.
  var cp = (leadCU - 0xd800) * 0x400 + (trailCU - 0xdc00) + 0x10000;
  // 3. Return the code point cp.
  return $.base<number>(cp, [lead, trail]);
}
