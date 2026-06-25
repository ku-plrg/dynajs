
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__IsRegExp ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (!($.peek($.isType(argument, "object"))))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>($.peek(argument) instanceof RegExp, []);
}
