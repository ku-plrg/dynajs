import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToString($: SpecRuntime, argument: Lifted<unknown>): Lifted<string> {
  "use strict";

  const unwrapped = $.peek(argument);
  if (typeof unwrapped === "symbol") throw new TypeError();

  // short-path to keep information about string
  if (typeof unwrapped === "string") return argument as Lifted<string>;

  // over-appoximate
  return $.base(String(unwrapped), [argument]);
}