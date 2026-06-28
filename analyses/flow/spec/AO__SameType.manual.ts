import type { Lifted, SpecRuntime } from "../type.js";

export function AO__SameType ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 537, $.is(x, $.default<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 538, $.is(y, $.default<undefined>(undefined, []))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 539, $.is(x, $.default<null>(null, []))) && $.condition(Number.MAX_SAFE_INTEGER - 540, $.is(y, $.default<null>(null, []))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "boolean"))) && ($.value($.isType(y, "boolean"))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "number"))) && ($.value($.isType(y, "number"))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "bigint"))) && ($.value($.isType(y, "bigint"))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "symbol"))) && ($.value($.isType(y, "symbol"))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "string"))) && ($.value($.isType(y, "string"))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.isType(x, "object"))) && ($.value($.isType(y, "object"))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
