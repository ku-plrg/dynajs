// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsStrictlyEqual } from "./AO__IsStrictlyEqual.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_lastIndexOf ($ : SpecRuntime, $this : Lifted<unknown>, searchElement : Lifted<unknown>, fromIndex : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var fromIndexIsPresent = arguments.length > 3;
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 175, $.is(len, $.default<number>(0, [])))))
  {
    return $.default<number>(-1, []);
  }

  if (fromIndexIsPresent)
  {
    var n = AO__ToIntegerOrInfinity($, (fromIndex as Lifted<unknown>));
  }
  else
  {
    var n = $.subtract((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 176, $.is(n, $.default<number>(-Infinity, [])))))
  {
    return $.default<number>(-1, []);
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 177, $.greaterThanEqual(n, $.default<number>(0, [])))))
  {
    var k = $.min(n, $.subtract((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)));
  }
  else
  {
    var k = $.add((len as Lifted<number>), (n as Lifted<number>));
  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 178, $.greaterThanEqual(k, $.default<number>(0, [])))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kPresent = AO__HasProperty($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 179, $.is(kPresent, $.default<boolean>(true, [])))))
    {
      var elementK = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 180, $.is(AO__IsStrictlyEqual($, (searchElement as Lifted<unknown>), (elementK as Lifted<unknown>)), $.default<boolean>(true, [])))))
      {
        return k;
      }

    }

    k = $.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return $.default<number>(-1, []);
}
