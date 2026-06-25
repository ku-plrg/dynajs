// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_some ($ : SpecRuntime, $this : Lifted<unknown>, callback : Lifted<unknown>, thisArg : Lifted<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 212, $.is(AO__IsCallable($, (callback as Lifted<unknown>)), $.lit<boolean>(false))))
  {
    throw new TypeError;
  }

  var k = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 213, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 214, $.is(kPresent, $.lit<boolean>(true))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      var testResult = AO__ToBoolean($, (AO__Call($, (callback as Lifted<unknown>), (thisArg as Lifted<unknown>), ([kValue, k, O] as Lifted<unknown>[])) as Lifted<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 215, $.is(testResult, $.lit<boolean>(true))))
      {
        return $.lit<boolean>(true);
      }

    }

    k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  return $.lit<boolean>(false);
}
