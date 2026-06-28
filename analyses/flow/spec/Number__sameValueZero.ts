// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function Number__sameValueZero ($ : SpecRuntime, x : Lifted<number>, y : Lifted<number>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 650, $.isNaN(x as Lifted<number>))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 651, $.isNaN(y as Lifted<number>))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 652, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 653, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 654, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 655, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 656, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
