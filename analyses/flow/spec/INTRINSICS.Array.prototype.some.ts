// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_some ($ : SpecRuntime, $this : Lifted<unknown>, callback : Lifted<unknown>, thisArg : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 221, $.is(AO__IsCallable($, (callback as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 222, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 223, $.is(kPresent, $.default<boolean>(true, [])))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      var testResult = AO__ToBoolean($, (AO__Call($, (callback as Lifted<unknown>), (thisArg as Lifted<unknown>), ([kValue, k, O] as Lifted<unknown>[])) as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 224, $.is(testResult, $.default<boolean>(true, [])))))
      {
        return $.default<boolean>(true, []);
      }

    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return $.default<boolean>(false, []);
}
