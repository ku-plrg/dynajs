export function AO__ToObject($: BootStrap, argument: Wrapped<unknown>): Unwrapped<object> {
  "use strict";

  if (argument === undefined || argument === null) throw new TypeError();

  return Object(argument);
}
