
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__IsLessThan } from "./AO__IsLessThan.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CompareArrayElements ($ : SpecRuntime, x : Wrapped<unknown>, y : Wrapped<unknown>, comparator : Wrapped<unknown>) {
  if (($.condition(Number.MAX_SAFE_INTEGER - 8, $.is(x, $.base<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 9, $.is(y, $.base<undefined>(undefined, [])))))
  {
    return $.base<number>(0, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 10, $.is(x, $.base<undefined>(undefined, []))))
  {
    return $.base<number>(1, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 11, $.is(y, $.base<undefined>(undefined, []))))
  {
    return $.base<number>(-1, []);
  }

  if (!$.condition(Number.MAX_SAFE_INTEGER - 12, $.is(comparator, $.base<undefined>(undefined, []))))
  {
    var v = AO__ToNumber($, (AO__Call($, (comparator as Wrapped<unknown>), ($.base<undefined>(undefined, []) as Wrapped<unknown>), ([x, y] as Wrapped<unknown>[])) as Wrapped<unknown>));
    if ($.isNaN(v as Wrapped<number>))
    {
      return $.base<number>(0, []);
    }

    return v;
  }

  var xString = AO__ToString($, (x as Wrapped<unknown>));
  var yString = AO__ToString($, (y as Wrapped<unknown>));
  var xSmaller = AO__IsLessThan($, (xString as Wrapped<unknown>), (yString as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 13, $.is(xSmaller, $.base<boolean>(true, []))))
  {
    return $.base<number>(-1, []);
  }

  var ySmaller = AO__IsLessThan($, (yString as Wrapped<unknown>), (xString as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 14, $.is(ySmaller, $.base<boolean>(true, []))))
  {
    return $.base<number>(1, []);
  }

  return $.base<number>(0, []);
}
