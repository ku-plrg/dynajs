import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function NUM__sameValueZero($: SpecRuntime, xW: Wrapped<number>, yW: Wrapped<number>) {
  const x = $.peek(xW);
  const y = $.peek(yW);

  // 1. If x is NaN and y is NaN, return true.
  if (isNaN(x) && isNaN(y)) return true;
  // 2. If x is +0𝔽 and y is -0𝔽, return true.
  if (Object.is(x, 0) && Object.is(y, -0)) return true;
  // 3. If x is -0𝔽 and y is +0𝔽, return true.
  if (Object.is(x, -0) && Object.is(y, 0)) return true;
  // 4. If x is y, return true.
  if (x === y) return true;
  // 5. Return false.
  return false;
}
