
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__SameType ($ : SpecRuntime, x : Wrapped<unknown>, y : Wrapped<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 537, $.is(x, $.base<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 538, $.is(y, $.base<undefined>(undefined, []))))
  {
    return $.base<boolean>(true, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 539, $.is(x, $.base<null>(null, []))) && $.condition(Number.MAX_SAFE_INTEGER - 540, $.is(y, $.base<null>(null, []))))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "boolean")) && ($.isType(y, "boolean")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "number")) && ($.isType(y, "number")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "bigint")) && ($.isType(y, "bigint")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "symbol")) && ($.isType(y, "symbol")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "string")) && ($.isType(y, "string")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(x, "object")) && ($.isType(y, "object")))
  {
    return $.base<boolean>(true, []);
  }

  return $.base<boolean>(false, []);
}
