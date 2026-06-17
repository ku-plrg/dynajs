
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsStrictlyEqual } from "./AO__IsStrictlyEqual.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_lastIndexOf ($ : SpecRuntime, $this : Wrapped<unknown>, searchElement : Wrapped<unknown>, fromIndex : Wrapped<unknown> = $.undef) {
  var fromIndexIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 139, $.is(len, $.base<number>(0, []))))
  {
    return $.base<number>(-1, []);
  }

  if (fromIndexIsPresent)
  {
    var n = AO__ToIntegerOrInfinity($, (fromIndex as Wrapped<unknown>));
  }
  else
  {
    var n = $.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 140, $.is(n, $.base<number>(-Infinity, []))))
  {
    return $.base<number>(-1, []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 141, $.greaterThanEqual(n, $.base<number>(0, []))))
  {
    var k = $.min(n, $.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)));
  }
  else
  {
    var k = $.add((len as Wrapped<number>), (n as Wrapped<number>));
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 142, $.greaterThanEqual(k, $.base<number>(0, []))))
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kPresent = AO__HasProperty($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 143, $.is(kPresent, $.base<boolean>(true, []))))
    {
      var elementK = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 144, $.is(AO__IsStrictlyEqual($, (searchElement as Wrapped<unknown>), (elementK as Wrapped<unknown>)), $.base<boolean>(true, []))))
      {
        return k;
      }

    }

    k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return $.base<number>(-1, []);
}
