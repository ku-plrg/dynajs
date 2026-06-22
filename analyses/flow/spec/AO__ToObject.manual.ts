import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__ToObject($: SpecRuntime, argument: Wrapped<unknown>): Wrapped<object> {
  "use strict";

  if (argument === undefined || argument === null) throw new TypeError();

  if (typeof $.peek(argument) === 'object') return argument as Wrapped<object>;

  return $.base(Object(argument), []);
}
