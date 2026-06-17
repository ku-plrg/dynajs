
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__SameType } from "./AO__SameType.js";
import { AO__StringToBigInt } from "./AO__StringToBigInt.js";
import { AO__ToNumeric } from "./AO__ToNumeric.js";
import { AO__ToPrimitive } from "./AO__ToPrimitive.js";

export function AO__IsLessThan ($ : SpecRuntime, x : Wrapped<unknown>, y : Wrapped<unknown>, LeftFirst : Wrapped<boolean>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 460, $.is(LeftFirst, $.base<boolean>(true, []))))
  {
    var px = AO__ToPrimitive($, (x as Wrapped<unknown>), ($.base<string>("number", []) as Wrapped<unknown>));
    var py = AO__ToPrimitive($, (y as Wrapped<unknown>), ($.base<string>("number", []) as Wrapped<unknown>));
  }
  else
  {
    var py = AO__ToPrimitive($, (y as Wrapped<unknown>), ($.base<string>("number", []) as Wrapped<unknown>));
    var px = AO__ToPrimitive($, (x as Wrapped<unknown>), ($.base<string>("number", []) as Wrapped<unknown>));
  }

  if (($.isType(px, "string")) && ($.isType(py, "string")))
  {
    var lx = $.length(px);
    var ly = $.length(py);
    for (var i = $.base<number>(0, []); $.condition(Number.MAX_SAFE_INTEGER - 463, $.lessThan(i, $.min(lx, ly))); i++)
    {
      var cx = $.codeUnitAt(px, i);
      var cy = $.codeUnitAt(py, i);
      if ($.condition(Number.MAX_SAFE_INTEGER - 461, $.lessThan(cx, cy)))
      {
        return $.base<boolean>(true, []);
      }

      if ($.condition(Number.MAX_SAFE_INTEGER - 462, $.greaterThan(cx, cy)))
      {
        return $.base<boolean>(false, []);
      }

    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 464, $.lessThan(lx, ly)))
    {
      return $.base<boolean>(true, []);
    }
    else
    {
      return $.base<boolean>(false, []);
    }

  }
  else
  {
    if (($.isType(px, "bigint")) && ($.isType(py, "string")))
    {
      var ny = AO__StringToBigInt($, (py as Wrapped<string>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 465, $.is(ny, $.base<undefined>(undefined, []))))
      {
        return $.base<undefined>(undefined, []);
      }

      return BigInt__lessThan(px, ny);
    }

    if (($.isType(px, "string")) && ($.isType(py, "bigint")))
    {
      var nx = AO__StringToBigInt($, (px as Wrapped<string>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 466, $.is(nx, $.base<undefined>(undefined, []))))
      {
        return $.base<undefined>(undefined, []);
      }

      return BigInt__lessThan(nx, py);
    }

    var nx = AO__ToNumeric($, (px as Wrapped<unknown>));
    var ny = AO__ToNumeric($, (py as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 467, $.is(AO__SameType($, (nx as Wrapped<unknown>), (ny as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      if (($.isType(nx, "number")))
      {
        return Number__lessThan(nx, ny);
      }
      else
      {
        return BigInt__lessThan(nx, ny);
      }

    }

    if ($.isNaN(nx as Wrapped<number>) || $.isNaN(ny as Wrapped<number>))
    {
      return $.base<undefined>(undefined, []);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 468, $.is(nx, $.base<number>(-Infinity, []))) || $.condition(Number.MAX_SAFE_INTEGER - 469, $.is(ny, $.base<number>(Infinity, []))))
    {
      return $.base<boolean>(true, []);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 470, $.is(nx, $.base<number>(Infinity, []))) || $.condition(Number.MAX_SAFE_INTEGER - 471, $.is(ny, $.base<number>(-Infinity, []))))
    {
      return $.base<boolean>(false, []);
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 472, $.lessThan(nx, ny)))
    {
      return $.base<boolean>(true, []);
    }
    else
    {
      return $.base<boolean>(false, []);
    }

  }

}
