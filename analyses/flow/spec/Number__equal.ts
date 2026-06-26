// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function Number__equal ($ : SpecRuntime, x : Lifted<number>, y : Lifted<number>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 624, $.isNaN(x as Lifted<number>))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 625, $.isNaN(y as Lifted<number>))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 626, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 627, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 628, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 629, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 630, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(true, []);
  }

  return $.default<boolean>(false, []);
}
