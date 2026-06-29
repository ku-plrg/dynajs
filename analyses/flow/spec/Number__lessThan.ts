// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function Number__lessThan ($ : SpecRuntime, x : Lifted<number>, y : Lifted<number>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 640, $.isNaN(x as Lifted<number>))))
  {
    return $.default<undefined>(undefined, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 641, $.isNaN(y as Lifted<number>))))
  {
    return $.default<undefined>(undefined, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 642, $.is(x, y))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 643, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 644, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 645, $.is(x, $.default<number>(0, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 646, $.is(y, $.default<number>(0, [])))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 647, $.is(x, $.default<number>(Infinity, [])))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 648, $.is(y, $.default<number>(Infinity, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 649, $.is(y, $.default<number>(-Infinity, [])))))
  {
    return $.default<boolean>(false, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 650, $.is(x, $.default<number>(-Infinity, [])))))
  {
    return $.default<boolean>(true, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 651, $.lessThan(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
