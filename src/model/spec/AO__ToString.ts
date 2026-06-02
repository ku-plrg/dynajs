// @manual

import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__ToString(__runtime__: BootStrap, argument: Wrapped<unknown>): Wrapped<string> {
  "use strict";

  if (typeof argument === "symbol") throw new TypeError();

  return __runtime__.base(String(argument), [argument]);
}