// @manual

import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__ToString($: BootStrap, argument: Wrapped<unknown>): Wrapped<string> {
  "use strict";

  if (typeof argument === "symbol") throw new TypeError();

  return $.base(String($.peek(argument)), [argument]);
}