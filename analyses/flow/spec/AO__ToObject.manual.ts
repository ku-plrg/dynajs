import type { SpecRuntime, Lifted, Unwrapped, Primitive } from "../type.js";

export function AO__ToObject($: SpecRuntime, argument: Lifted<unknown>): Lifted<object> {
  "use strict";

  if (argument === undefined || argument === null) throw new TypeError();

  if (typeof $.peek(argument) === 'object') return argument as Lifted<object>;

  return $.base(Object(argument), []);
}
