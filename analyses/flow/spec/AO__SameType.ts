// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__SameType ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 702, $.is(x, $.default<undefined>(undefined, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 703, $.is(y, $.default<undefined>(undefined, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 704, $.is(x, $.default<null>(null, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 705, $.is(y, $.default<null>(null, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 706, $.isType(x, "boolean")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 707, $.isType(y, "boolean")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 708, $.isType(x, "number")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 709, $.isType(y, "number")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 710, $.isType(x, "bigint")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 711, $.isType(y, "bigint")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 712, $.isType(x, "record[symbol]")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 713, $.isType(y, "record[symbol]")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 714, $.isType(x, "string")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 715, $.isType(y, "string")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 716, $.isType(x, "object")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 717, $.isType(y, "object")))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
