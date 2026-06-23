import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__ThisStringValue ($ : SpecRuntime, value : Wrapped<unknown>) {
  if (($.peek($.isType(value, "string"))))
  {
    return value;
  }

  if (($.peek($.isType(value, "object"))) && ($.peek(value) instanceof String))
  {
    var s = $.peek(value).toString();
    return $.base(s, [value]);
  }

  throw new TypeError;
}
