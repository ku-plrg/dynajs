// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_push ($ : SpecRuntime, $this : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var argCount = $.base<number>(items.length, []);
  if ($.condition(Number.MAX_SAFE_INTEGER - 176, $.greaterThan($.add((len as Wrapped<number>), (argCount as Wrapped<number>)), $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(53)) as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>)))))
  {
    throw new TypeError;
  }

  for (var E of items)
  {
    AO__Set($, (O as Wrapped<unknown>), (AO__ToString($, (len as Wrapped<unknown>)) as Wrapped<unknown>), (E as Wrapped<unknown>), ($.lit<boolean>(true) as Wrapped<boolean>));
    len = $.add((len as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
  }

  AO__Set($, (O as Wrapped<unknown>), ($.lit<string>("length") as Wrapped<unknown>), (len as Wrapped<unknown>), ($.lit<boolean>(true) as Wrapped<boolean>));
  return len;
}
