import type { SpecRuntime, Lifted } from "../type.js";

export function AO__RequireObjectCoercible($: SpecRuntime, argument: Lifted<unknown>): Lifted<unknown> {
  "use strict";

  const v = $.value(argument);
  // 1. If argument is either undefined or null, throw a TypeError exception.
  if (v === undefined || v === null) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  // 2. Return argument.
  return argument;
}
