// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function AO__ThisStringValue ($ : SpecRuntime, value : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 792, $.isType(value, "string")))))
  {
    return value;
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 793, $.isType(value, "object")))) && ($.value(value) instanceof String))
  {
    var s = $.default($.value(value as Lifted<String>).valueOf(), [value]);
    return s;
  }

  throw new TypeError;
}
