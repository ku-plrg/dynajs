export function AO__RequireObjectCoercible(__runtime__: BootStrap, argument: Wrapped<unknown>): Wrapped<unknown> {
  "use strict";

  const v = __runtime__.peek(argument);
  // 1. If argument is either undefined or null, throw a TypeError exception.
  if (v === undefined || v === null) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  // 2. Return argument.
  return argument;
}
