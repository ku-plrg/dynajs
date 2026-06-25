// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_reduce ($ : SpecRuntime, $this : Lifted<unknown>, callback : Lifted<unknown>, initialValue : Lifted<unknown> = $.undef) {
  var initialValueIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 177, $.is(AO__IsCallable($, (callback as Lifted<unknown>)), $.lit<boolean>(false))))
  {
    throw new TypeError;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 178, $.is(len, $.lit<number>(0))) && !initialValueIsPresent)
  {
    throw new TypeError;
  }

  var k = $.lit<number>(0);
  var accumulator = $.lit<undefined>(undefined);
  if (initialValueIsPresent)
  {
    accumulator = initialValue;
  }
  else
  {
    var kPresent = $.lit<boolean>(false);
    while ($.condition(Number.MAX_SAFE_INTEGER - 179, $.is(kPresent, $.lit<boolean>(false))) && $.condition(Number.MAX_SAFE_INTEGER - 180, $.lessThan(k, len)))
    {
      var Pk = AO__ToString($, (k as Lifted<unknown>));
      kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 181, $.is(kPresent, $.lit<boolean>(true))))
      {
        accumulator = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      }

      k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 182, $.is(kPresent, $.lit<boolean>(false))))
    {
      throw new TypeError;
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 183, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 184, $.is(kPresent, $.lit<boolean>(true))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      accumulator = AO__Call($, (callback as Lifted<unknown>), ($.lit<undefined>(undefined) as Lifted<unknown>), ([accumulator, kValue, k, O] as Lifted<unknown>[]));
    }

    k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  return accumulator;
}
