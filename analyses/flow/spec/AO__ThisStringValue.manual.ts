import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__ThisStringValue ($ : SpecRuntime, value : Lifted<unknown>) {
  if (($.value($.isType(value, "string"))))
  {
    return value;
  }

  if (($.value($.isType(value, "object"))) && ($.value(value) instanceof String))
  {
    var s = $.value(value).toString();
    return $.default(s, [value]);
  }

  throw new TypeError;
}
