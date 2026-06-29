// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function Number__sameValueZero ($ : SpecRuntime, x : Lifted<number>, y : Lifted<number>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 659, $.isNaN(x as Lifted<number>))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 660, $.isNaN(y as Lifted<number>))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 661, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 662, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 663, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 664, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 665, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
