// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function Number__equal ($ : SpecRuntime, x : Lifted<number>, y : Lifted<number>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 633, $.isNaN(x as Lifted<number>))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 634, $.isNaN(y as Lifted<number>))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 635, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 636, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 637, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 638, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 639, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
