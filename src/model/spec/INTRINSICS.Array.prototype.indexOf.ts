
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsStrictlyEqual } from "./AO__IsStrictlyEqual.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_indexOf ($ : SpecRuntime, $this : Wrapped<unknown>, searchElement : Wrapped<unknown>, fromIndex : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 126, $.is(len, $.base<number>(0, []))))
  {
    return $.base<number>(-1, []);
  }

  var n = AO__ToIntegerOrInfinity($, (fromIndex as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 127, $.is(n, $.base<number>(Infinity, []))))
  {
    return $.base<number>(-1, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 128, $.is(n, $.base<number>(-Infinity, []))))
    {
      n = $.base<number>(0, []);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 129, $.greaterThanEqual(n, $.base<number>(0, []))))
  {
    var k = n;
  }
  else
  {
    var k = $.add((len as Wrapped<number>), (n as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 130, $.lessThan(k, $.base<number>(0, []))))
    {
      k = $.base<number>(0, []);
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 131, $.lessThan(k, len)))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 132, $.is(kPresent, $.base<boolean>(true, []))))
    {
      var elementK = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 133, $.is(AO__IsStrictlyEqual($, (searchElement as Wrapped<unknown>), (elementK as Wrapped<unknown>)), $.base<boolean>(true, []))))
      {
        return k;
      }

    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return $.base<number>(-1, []);
}
