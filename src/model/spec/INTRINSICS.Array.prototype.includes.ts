
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SameValueZero } from "./AO__SameValueZero.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_includes ($ : SpecRuntime, $this : Wrapped<unknown>, searchElement : Wrapped<unknown>, fromIndex : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 119, $.is(len, $.base<number>(0, []))))
  {
    return $.base<boolean>(false, []);
  }

  var n = AO__ToIntegerOrInfinity($, (fromIndex as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 120, $.is(n, $.base<number>(Infinity, []))))
  {
    return $.base<boolean>(false, []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 121, $.is(n, $.base<number>(-Infinity, []))))
    {
      n = $.base<number>(0, []);
    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 122, $.greaterThanEqual(n, $.base<number>(0, []))))
  {
    var k = n;
  }
  else
  {
    var k = $.add((len as Wrapped<number>), (n as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 123, $.lessThan(k, $.base<number>(0, []))))
    {
      k = $.base<number>(0, []);
    }

  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 124, $.lessThan(k, len)))
  {
    var elementK = AO__Get($, (O as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 125, $.is(AO__SameValueZero($, (searchElement as Wrapped<unknown>), (elementK as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      return $.base<boolean>(true, []);
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return $.base<boolean>(false, []);
}
