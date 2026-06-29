// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__SameType } from "./AO__SameType.js";
import { AO__StringToBigInt } from "./AO__StringToBigInt.js";
import { AO__ToNumeric } from "./AO__ToNumeric.js";
import { AO__ToPrimitive } from "./AO__ToPrimitive.js";
import { BigInt__lessThan } from "./BigInt__lessThan.js";
import { Number__lessThan } from "./Number__lessThan.js";

export function AO__IsLessThan ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>, LeftFirst : Lifted<boolean>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 571, $.is(LeftFirst, $.default<boolean>(true, [])))))
  {
    var px = AO__ToPrimitive($, (x as Lifted<unknown>), ($.default<string>("number", []) as Lifted<unknown>));
    var py = AO__ToPrimitive($, (y as Lifted<unknown>), ($.default<string>("number", []) as Lifted<unknown>));
  }
  else
  {
    var py = AO__ToPrimitive($, (y as Lifted<unknown>), ($.default<string>("number", []) as Lifted<unknown>));
    var px = AO__ToPrimitive($, (x as Lifted<unknown>), ($.default<string>("number", []) as Lifted<unknown>));
  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 572, $.isType(px, "string")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 573, $.isType(py, "string")))))
  {
    var lx = $.length(px);
    var ly = $.length(py);
    for (var i of $.range(($.default<number>(0, []) as Lifted<number>), true, ($.min(lx, ly) as Lifted<number>), false, true, Number.MAX_SAFE_INTEGER - 576))
    {
      var cx = $.codeUnitAt(px, i);
      var cy = $.codeUnitAt(py, i);
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 574, $.lessThan(cx, cy))))
      {
        return $.default<boolean>(true, []);
      }

      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 575, $.greaterThan(cx, cy))))
      {
        return $.default<boolean>(false, []);
      }

    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 577, $.lessThan(lx, ly))))
    {
      return $.default<boolean>(true, []);
    }
    else
    {
      return $.default<boolean>(false, []);
    }

  }
  else
  {
    if (($.value($.condition(Number.MAX_SAFE_INTEGER - 578, $.isType(px, "bigint")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 579, $.isType(py, "string")))))
    {
      var ny = AO__StringToBigInt($, (py as Lifted<string>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 580, $.is(ny, $.default<undefined>(undefined, [])))))
      {
        return $.default<undefined>(undefined, []);
      }

      return BigInt__lessThan($, (px as Lifted<bigint>), (ny as Lifted<bigint>));
    }

    if (($.value($.condition(Number.MAX_SAFE_INTEGER - 581, $.isType(px, "string")))) && ($.value($.condition(Number.MAX_SAFE_INTEGER - 582, $.isType(py, "bigint")))))
    {
      var nx = AO__StringToBigInt($, (px as Lifted<string>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 583, $.is(nx, $.default<undefined>(undefined, [])))))
      {
        return $.default<undefined>(undefined, []);
      }

      return BigInt__lessThan($, (nx as Lifted<bigint>), (py as Lifted<bigint>));
    }

    var nx = AO__ToNumeric($, (px as Lifted<unknown>));
    var ny = AO__ToNumeric($, (py as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 584, $.is(AO__SameType($, (nx as Lifted<unknown>), (ny as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      if (($.value($.condition(Number.MAX_SAFE_INTEGER - 585, $.isType(nx, "number")))))
      {
        return Number__lessThan($, (nx as Lifted<number>), (ny as Lifted<number>));
      }
      else
      {
        return BigInt__lessThan($, (nx as Lifted<bigint>), (ny as Lifted<bigint>));
      }

    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 586, $.isNaN(nx as Lifted<number>))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 587, $.isNaN(ny as Lifted<number>))))
    {
      return $.default<undefined>(undefined, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 588, $.is(nx, $.default<number>(-Infinity, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 589, $.is(ny, $.default<number>(Infinity, [])))))
    {
      return $.default<boolean>(true, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 590, $.is(nx, $.default<number>(Infinity, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 591, $.is(ny, $.default<number>(-Infinity, [])))))
    {
      return $.default<boolean>(false, []);
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 592, $.lessThan(nx, ny))))
    {
      return $.default<boolean>(true, []);
    }
    else
    {
      return $.default<boolean>(false, []);
    }

  }

}
