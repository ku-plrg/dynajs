
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_unshift ($ : SpecRuntime, $this : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var argCount = $.base<number>(items.length, []);
  if ($.condition(Number.MAX_SAFE_INTEGER - 219, $.greaterThan(argCount, $.base<number>(0, []))))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 220, $.greaterThan($.add((len as Wrapped<number>), (argCount as Wrapped<number>)), $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
    {
      throw new TypeError;
    }

    var k = len;
    while ($.condition(Number.MAX_SAFE_INTEGER - 221, $.greaterThan(k, $.base<number>(0, []))))
    {
      var from = AO__ToString($, ($.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
      var to = AO__ToString($, ($.subtract(($.add((k as Wrapped<number>), (argCount as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
      var fromPresent = AO__HasProperty($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 222, $.is(fromPresent, $.base<boolean>(true, []))))
      {
        var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
        AO__Set($, (O as Wrapped<unknown>), (to as Wrapped<unknown>), (fromValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
      }
      else
      {
        AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (to as Wrapped<unknown>));
      }

      k = $.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

    var j = $.base<number>(0, []);
    for (var _x0 = 0; _x0 < items.length; _x0++)
    {
      var E = items[_x0];
      AO__Set($, (O as Wrapped<unknown>), (AO__ToString($, (j as Wrapped<unknown>)) as Wrapped<unknown>), (E as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
      j = $.add((j as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

  }

  AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), ($.add((len as Wrapped<number>), (argCount as Wrapped<number>)) as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  return $.add((len as Wrapped<number>), (argCount as Wrapped<number>));
}
