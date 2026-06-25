import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__IsCallable($: SpecRuntime, argument : Lifted<unknown>) : Lifted<boolean> {
  "use strict";

  const arg = $.value(argument);

  return $.default(typeof arg === "function", []);
}
