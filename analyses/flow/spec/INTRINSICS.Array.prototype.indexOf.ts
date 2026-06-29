// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsStrictlyEqual } from "./AO__IsStrictlyEqual.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_indexOf ($ : SpecRuntime, $this : Lifted<unknown>, searchElement : Lifted<unknown>, fromIndex : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 162, $.is(len, $.default<number>(0, [])))))
  {
    return $.default<number>(-1, []);
  }

  var n = AO__ToIntegerOrInfinity($, (fromIndex as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 163, $.is(n, $.default<number>(Infinity, [])))))
  {
    return $.default<number>(-1, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 164, $.is(n, $.default<number>(-Infinity, [])))))
    {
      n = $.default<number>(0, []);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 165, $.greaterThanEqual(n, $.default<number>(0, [])))))
  {
    var k = n;
  }
  else
  {
    var k = $.add((len as Lifted<number>), (n as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 166, $.lessThan(k, $.default<number>(0, [])))))
    {
      k = $.default<number>(0, []);
    }

  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 167, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 168, $.is(kPresent, $.default<boolean>(true, [])))))
    {
      var elementK = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 169, $.is(AO__IsStrictlyEqual($, (searchElement as Lifted<unknown>), (elementK as Lifted<unknown>)), $.default<boolean>(true, [])))))
      {
        return k;
      }

    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return $.default<number>(-1, []);
}
