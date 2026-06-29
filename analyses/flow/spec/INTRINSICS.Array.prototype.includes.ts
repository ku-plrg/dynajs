// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SameValueZero } from "./AO__SameValueZero.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_includes ($ : SpecRuntime, $this : Lifted<unknown>, searchElement : Lifted<unknown>, fromIndex : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 155, $.is(len, $.default<number>(0, [])))))
  {
    return $.default<boolean>(false, []);
  }

  var n = AO__ToIntegerOrInfinity($, (fromIndex as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 156, $.is(n, $.default<number>(Infinity, [])))))
  {
    return $.default<boolean>(false, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 157, $.is(n, $.default<number>(-Infinity, [])))))
    {
      n = $.default<number>(0, []);
    }

  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 158, $.greaterThanEqual(n, $.default<number>(0, [])))))
  {
    var k = n;
  }
  else
  {
    var k = $.add((len as Lifted<number>), (n as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 159, $.lessThan(k, $.default<number>(0, [])))))
    {
      k = $.default<number>(0, []);
    }

  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 160, $.lessThan(k, len))))
  {
    var elementK = AO__Get($, (O as Lifted<unknown>), (AO__ToString($, (k as Lifted<unknown>)) as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 161, $.is(AO__SameValueZero($, (searchElement as Lifted<unknown>), (elementK as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      return $.default<boolean>(true, []);
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return $.default<boolean>(false, []);
}
