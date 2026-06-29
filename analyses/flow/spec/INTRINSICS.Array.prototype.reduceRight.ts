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

export function INTRINSICS_Array_prototype_reduceRight ($ : SpecRuntime, $this : Lifted<unknown>, callback : Lifted<unknown>, initialValue : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var initialValueIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 194, $.is(AO__IsCallable($, (callback as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 195, $.is(len, $.default<number>(0, [])))) && !initialValueIsPresent)
  {
    throw new TypeError;
  }

  var k = $.subtract((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  var accumulator = $.default<undefined>(undefined, []);
  if (initialValueIsPresent)
  {
    accumulator = initialValue;
  }
  else
  {
    var kPresent = $.default<boolean>(false, []);
    while ($.value($.condition(Number.MAX_SAFE_INTEGER - 196, $.is(kPresent, $.default<boolean>(false, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 197, $.greaterThanEqual(k, $.default<number>(0, [])))))
    {
      var Pk = AO__ToString($, (k as Lifted<unknown>));
      kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 198, $.is(kPresent, $.default<boolean>(true, [])))))
      {
        accumulator = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      }

      k = $.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 199, $.is(kPresent, $.default<boolean>(false, [])))))
    {
      throw new TypeError;
    }

  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 200, $.greaterThanEqual(k, $.default<number>(0, [])))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 201, $.is(kPresent, $.default<boolean>(true, [])))))
    {
      var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      accumulator = AO__Call($, (callback as Lifted<unknown>), ($.default<undefined>(undefined, []) as Lifted<unknown>), ([accumulator, kValue, k, O] as Lifted<unknown>[]));
    }

    k = $.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return accumulator;
}
