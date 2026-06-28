// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__ThisStringValue ($ : SpecRuntime, value : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 782, $.isType(value, "string")))))
  {
    return value;
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 783, $.isType(value, "object")))) && ($.value(value) instanceof String))
  {
    var s = $.default($.value(value).valueOf(), [value]);
    return s;
  }

  throw new TypeError;
}
