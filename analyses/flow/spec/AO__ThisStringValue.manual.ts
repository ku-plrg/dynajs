import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__ThisStringValue ($ : SpecRuntime, value : Lifted<unknown>) {
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
