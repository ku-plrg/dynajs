import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__IsCallable($: SpecRuntime, argument : Lifted<unknown>) : Lifted<boolean> {
  "use strict";

  const arg = $.peek(argument);

  return $.base(typeof arg === "function", []);
}
