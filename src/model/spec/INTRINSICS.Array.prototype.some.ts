
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_some ($ : SpecRuntime, $this : Wrapped<unknown>, callback : Wrapped<unknown>, thisArg : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 185, $.is(AO__IsCallable($, (callback as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 186, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 187, $.is(kPresent, $.base<boolean>(true, []))))
    {
      var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      var testResult = AO__ToBoolean($, (AO__Call($, (callback as Wrapped<unknown>), (thisArg as Wrapped<unknown>), ([kValue, k, O] as Wrapped<unknown>[])) as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 188, $.is(testResult, $.base<boolean>(true, []))))
      {
        return $.base<boolean>(true, []);
      }

    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return $.base<boolean>(false, []);
}
