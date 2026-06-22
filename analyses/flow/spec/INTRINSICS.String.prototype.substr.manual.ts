import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";

export function INTRINSICS_String_prototype_substr ($ : SpecRuntime, $this : Wrapped<unknown>, start : Wrapped<unknown>, length : Wrapped<unknown> = $.undef) {
  // 1. Let O be ? RequireObjectCoercible(this value).
  const O = AO__RequireObjectCoercible($, $this);
  // 2. Let S be ? ToString(O).
  const S = AO__ToString($, O);
  // 3. Let size be the length of S.
  const size = $.length(S);
  // 4. Let intStart be ? ToIntegerOrInfinity(start).
  let intStart = AO__ToIntegerOrInfinity($, start);
  // 5. If intStart = -∞, set intStart to 0.
  if ($.is(intStart, $.base(-Infinity, []))) intStart = $.base(0, []);
  // 6. Else if intStart < 0, set intStart to max(size + intStart, 0).
  else if ($.lessThan(intStart, $.base(0, []))) intStart = $.max($.add(size, intStart), $.base(0, []));
  // 7. Else, set intStart to min(intStart, size).
  else intStart = $.min(intStart, size);
  // 8. If length is undefined, let intLength be size; otherwise let intLength be ? ToIntegerOrInfinity(length).
  let intLength : Wrapped<number>;
  if ($.is(length, $.undef)) intLength = size; else intLength = AO__ToIntegerOrInfinity($, length);
  // 9. Set intLength to the result of clamping intLength between 0 and size.
  intLength = $.max($.min(intLength, size), $.base(0, []));
  // 10. Let intEnd be min(intStart + intLength, size).
  const intEnd = $.min($.add(intStart, intLength), size);
  // 11. Return the substring of S from intStart to intEnd.
  return $.substring(S, intStart, intEnd);
}