// @manual

import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__ToString($: BootStrap, argument: Wrapped<unknown>): Wrapped<string> {
  "use strict";

  const unwrapped = $.peek(argument);
  if (typeof unwrapped === "symbol") throw new TypeError();

  // short-path to keep information about string
  if (typeof unwrapped === "string") return argument as Wrapped<string>;

  // over-appoximate
  return $.base(String(unwrapped), [argument]);
}