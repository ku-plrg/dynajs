// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_push ($ : SpecRuntime, $this : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var argCount = $.base<number>(items.length, []);
  if ($.condition(Number.MAX_SAFE_INTEGER - 153, $.greaterThan($.add((len as Wrapped<number>), (argCount as Wrapped<number>)), $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
  {
    throw new TypeError;
  }

  for (var _x0 = 0; _x0 < items.length; _x0++)
  {
    var E = items[_x0];
    AO__Set($, (O as Wrapped<unknown>), (AO__ToString($, (len as Wrapped<unknown>)) as Wrapped<unknown>), (E as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    len = $.add((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), (len as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  return len;
}
