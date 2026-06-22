import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

import { AO__ToNumber } from './AO__ToNumber.js'

export function AO__ToIntegerOrInfinity($: SpecRuntime, argument: Wrapped<unknown>): Wrapped<number> {
  "use strict";

  // 1. Let number be ? ToNumber(argument).
  var number = AO__ToNumber($, argument);
  var n = $.peek(number);

  // 2. If number is one of NaN, +0𝔽, or -0𝔽, return 0.
  if (isNaN(n)) {
    return $.base<number>(0, []);
  }

  // To improve precision;
  if (n === 0) {
    return number;
  }

  // 3. If number is +∞𝔽, return +∞.
  // 4. If number is -∞𝔽, return -∞.
  if (!isFinite(n)) {
    return $.base<number>(n, []);
  }

  // 5. Return truncate(ℝ(number)).
  return $.truncate(argument as Wrapped<number>);
}

