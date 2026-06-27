import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToPrimitive } from "./AO__ToPrimitive.js";

export function AO__ToString($: SpecRuntime, argument: Lifted<unknown>): Lifted<string> {
  "use strict";

  let unlifted = $.value(argument);

  // ToString(Object) = ToString(? ToPrimitive(argument, string)). Coerce via the
  // model so a user valueOf/toString runs lifted; a native String(object) would
  // re-enter it and reject the lifted-primitive return. Then fall through to the
  // primitive path below (so a returned symbol still throws).
  if (unlifted !== null && (typeof unlifted === "object" || typeof unlifted === "function")) {
    argument = AO__ToPrimitive($, argument, $.default("string", []));
    unlifted = $.value(argument);
  }

  if (typeof unlifted === "symbol") throw new TypeError();

  // short-path to keep information about string
  if (typeof unlifted === "string") return argument as Lifted<string>;

  // over-appoximate
  return $.default(String(unlifted), [argument]);
}