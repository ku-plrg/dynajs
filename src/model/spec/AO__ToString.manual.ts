import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__ToString($: SpecRuntime, argument: Wrapped<unknown>): Wrapped<string> {
  "use strict";

  const unwrapped = $.peek(argument);
  if (typeof unwrapped === "symbol") throw new TypeError();

  // short-path to keep information about string
  if (typeof unwrapped === "string") return argument as Wrapped<string>;

  // over-appoximate
  return $.base(String(unwrapped), [argument]);
}