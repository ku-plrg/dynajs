import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__ToObject($: SpecRuntime, argument: Lifted<unknown>): Lifted<object> {
  "use strict";

  if (argument === undefined || argument === null) throw new TypeError();

  if (typeof $.value(argument) === 'object') return argument as Lifted<object>;

  return $.default(Object(argument), []);
}
