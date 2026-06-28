import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__ToNumber } from './AO__ToNumber.js'

export function AO__ToIntegerOrInfinity($: SpecRuntime, argument: Lifted<unknown>): Lifted<number> {
  "use strict";

  // 1. Let number be ? ToNumber(argument).
  var number = AO__ToNumber($, argument);
  var n = $.value(number);

  // 2. If number is one of NaN, +0𝔽, or -0𝔽, return 0.
  if (isNaN(n)) {
    return $.default<number>(0, []);
  }

  // To improve precision;
  if (n === 0) {
    return number;
  }

  // 3. If number is +∞𝔽, return +∞.
  // 4. If number is -∞𝔽, return -∞.
  if (!isFinite(n)) {
    return $.default<number>(n, []);
  }

  // 5. Return truncate(ℝ(number)).
  return $.truncate(number);
}

