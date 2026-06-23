// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_reduceRight ($ : SpecRuntime, $this : Wrapped<unknown>, callback : Wrapped<unknown>, initialValue : Wrapped<unknown> = $.undef) {
  var initialValueIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 185, $.is(AO__IsCallable($, (callback as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 186, $.is(len, $.base<number>(0, []))) && !initialValueIsPresent)
  {
    throw new TypeError;
  }

  var k = $.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  var accumulator = $.base<undefined>(undefined, []);
  if (initialValueIsPresent)
  {
    accumulator = initialValue;
  }
  else
  {
    var kPresent = $.base<boolean>(false, []);
    while ($.condition(Number.MAX_SAFE_INTEGER - 187, $.is(kPresent, $.base<boolean>(false, []))) && $.condition(Number.MAX_SAFE_INTEGER - 188, $.greaterThanEqual(k, $.base<number>(0, []))))
    {
      var Pk = AO__ToString($, (k as Wrapped<unknown>));
      kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 189, $.is(kPresent, $.base<boolean>(true, []))))
      {
        accumulator = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      }

      k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 190, $.is(kPresent, $.base<boolean>(false, []))))
    {
      throw new TypeError;
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 191, $.greaterThanEqual(k, $.base<number>(0, []))))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 192, $.is(kPresent, $.base<boolean>(true, []))))
    {
      var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      accumulator = AO__Call($, (callback as Wrapped<unknown>), ($.base<undefined>(undefined, []) as Wrapped<unknown>), ([accumulator, kValue, k, O] as Wrapped<unknown>[]));
    }

    k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return accumulator;
}
