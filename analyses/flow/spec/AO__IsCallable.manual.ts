import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__IsCallable($: SpecRuntime, argument : Wrapped<unknown>) : Wrapped<boolean> {
  "use strict";

  const arg = $.peek(argument);

  return $.base(typeof arg === "function", []);
}
