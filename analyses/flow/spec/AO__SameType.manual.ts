
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__SameType ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 537, $.is(x, $.base<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 538, $.is(y, $.base<undefined>(undefined, []))))
  {
    return $.base<boolean>(true, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 539, $.is(x, $.base<null>(null, []))) && $.condition(Number.MAX_SAFE_INTEGER - 540, $.is(y, $.base<null>(null, []))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "boolean"))) && ($.peek($.isType(y, "boolean"))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "number"))) && ($.peek($.isType(y, "number"))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "bigint"))) && ($.peek($.isType(y, "bigint"))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "symbol"))) && ($.peek($.isType(y, "symbol"))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "string"))) && ($.peek($.isType(y, "string"))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.peek($.isType(x, "object"))) && ($.peek($.isType(y, "object"))))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
