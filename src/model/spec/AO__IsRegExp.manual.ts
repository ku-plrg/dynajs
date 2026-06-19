
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__IsRegExp ($ : SpecRuntime, argument : Wrapped<unknown>) {
  if (!($.isType(argument, "object")))
  {
    return $.base<boolean>(false, []);
  }

  return $.base<boolean>($.peek(argument) instanceof RegExp, []);
}
