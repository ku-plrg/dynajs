import type { Lifted, SpecRuntime } from "../type.js";

export function AO__IsArray ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (!($.value($.isType(argument, "object"))))
  {
    return $.default<boolean>(false, []);
  }

  if (Array.isArray($.value(argument)))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
