// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function AO__SameType ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 711, $.is(x, $.default<undefined>(undefined, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 712, $.is(y, $.default<undefined>(undefined, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 713, $.is(x, $.default<null>(null, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 714, $.is(y, $.default<null>(null, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 715, $.isType(x, "boolean")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 716, $.isType(y, "boolean")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 717, $.isType(x, "number")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 718, $.isType(y, "number")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 719, $.isType(x, "bigint")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 720, $.isType(y, "bigint")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 721, $.isType(x, "symbol")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 722, $.isType(y, "symbol")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 723, $.isType(x, "string")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 724, $.isType(y, "string")))))
  {
    return $.default<boolean>(true, []);
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 725, $.isType(x, "object")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 726, $.isType(y, "object")))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
