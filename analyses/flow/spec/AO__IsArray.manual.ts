// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__IsArray ($ : SpecRuntime, argument : Lifted<unknown>) {
  if (!($.peek($.isType(argument, "object"))))
  {
    return $.base<boolean>(false, []);
  }

  if (Array.isArray($.peek(argument)))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
