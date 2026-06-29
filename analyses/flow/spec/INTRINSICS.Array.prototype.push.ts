// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_push ($ : SpecRuntime, $this : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var argCount = $.default<number>(items.length, []);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 185, $.greaterThan($.add((len as Lifted<number>), (argCount as Lifted<number>)), $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
  {
    throw new TypeError;
  }

  for (var E of items)
  {
    AO__Set($, (O as Lifted<unknown>), (AO__ToString($, (len as Lifted<unknown>)) as Lifted<unknown>), (E as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    len = $.add((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__Set($, (O as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (len as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return len;
}
