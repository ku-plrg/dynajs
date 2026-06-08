// @manual

export function AO__ToIntegerOrInfinity($: BootStrap, argument: Wrapped<unknown>): Wrapped<number> {
  "use strict";

  // 1. Let number be ? ToNumber(argument).
  var number = +$.peek(argument);

  // 2. If number is one of NaN, +0𝔽, or -0𝔽, return 0.
  if (isNaN(number) || number === 0) {
    return $.base<number>(0, []);
  }

  // 3. If number is +∞𝔽, return +∞.
  // 4. If number is -∞𝔽, return -∞.
  if (!isFinite(number)) {
    return $.base<number>(number, []);
  }

  // 5. Return truncate(ℝ(number)).
  return $.base<number>(Math.trunc(number), []);
}

