import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ToString($: SpecRuntime, argument: Lifted<unknown>): Lifted<string> {
  "use strict";

  const unlifted = $.value(argument);
  if (typeof unlifted === "symbol") throw new TypeError();

  // short-path to keep information about string
  if (typeof unlifted === "string") return argument as Lifted<string>;

  // over-appoximate
  return $.default(String(unlifted), [argument]);
}