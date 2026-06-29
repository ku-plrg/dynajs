// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__IsLessThan } from "./AO__IsLessThan.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CompareArrayElements ($ : SpecRuntime, x : Lifted<unknown>, y : Lifted<unknown>, comparator : Lifted<unknown>) {
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 19, $.is(x, $.default<undefined>(undefined, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 20, $.is(y, $.default<undefined>(undefined, []))))))
  {
    return $.default<number>(0, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 21, $.is(x, $.default<undefined>(undefined, [])))))
  {
    return $.default<number>(1, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 22, $.is(y, $.default<undefined>(undefined, [])))))
  {
    return $.default<number>(-1, []);
  }

  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 23, $.is(comparator, $.default<undefined>(undefined, [])))))
  {
    var v = AO__ToNumber($, (AO__Call($, (comparator as Lifted<unknown>), ($.default<undefined>(undefined, []) as Lifted<unknown>), ([x, y] as Lifted<unknown>[])) as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 24, $.isNaN(v as Lifted<number>))))
    {
      return $.default<number>(0, []);
    }

    return v;
  }

  var xString = AO__ToString($, (x as Lifted<unknown>));
  var yString = AO__ToString($, (y as Lifted<unknown>));
  var xSmaller = AO__IsLessThan($, (xString as Lifted<unknown>), (yString as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 25, $.is(xSmaller, $.default<boolean>(true, [])))))
  {
    return $.default<number>(-1, []);
  }

  var ySmaller = AO__IsLessThan($, (yString as Lifted<unknown>), (xString as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 26, $.is(ySmaller, $.default<boolean>(true, [])))))
  {
    return $.default<number>(1, []);
  }

  return $.default<number>(0, []);
}
