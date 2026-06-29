// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_reduce ($ : SpecRuntime, $this : Lifted<unknown>, callback : Lifted<unknown>, initialValue : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var initialValueIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 186, $.is(AO__IsCallable($, (callback as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 187, $.is(len, $.default<number>(0, [])))) && !initialValueIsPresent)
  {
    throw new TypeError;
  }

  var k = $.default<number>(0, []);
  var accumulator = $.default<undefined>(undefined, []);
  if (initialValueIsPresent)
  {
    accumulator = initialValue;
  }
  else
  {
    var kPresent = $.default<boolean>(false, []);
    while ($.value($.condition(Number.MAX_SAFE_INTEGER - 188, $.is(kPresent, $.default<boolean>(false, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 189, $.lessThan(k, len))))
    {
      var Pk = AO__ToString($, (k as Lifted<unknown>));
      kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 190, $.is(kPresent, $.default<boolean>(true, [])))))
      {
        accumulator = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      }

      k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 191, $.is(kPresent, $.default<boolean>(false, [])))))
    {
      throw new TypeError;
    }

  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 192, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 193, $.is(kPresent, $.default<boolean>(true, [])))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      accumulator = AO__Call($, (callback as Lifted<unknown>), ($.default<undefined>(undefined, []) as Lifted<unknown>), ([accumulator, kValue, k, O] as Lifted<unknown>[]));
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return accumulator;
}
