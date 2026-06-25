// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_unshift ($ : SpecRuntime, $this : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var argCount = $.base<number>(items.length, []);
  if ($.condition(Number.MAX_SAFE_INTEGER - 246, $.greaterThan(argCount, $.lit<number>(0))))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 247, $.greaterThan($.add((len as Lifted<number>), (argCount as Lifted<number>)), $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(53)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>)))))
    {
      throw new TypeError;
    }

    var k = len;
    while ($.condition(Number.MAX_SAFE_INTEGER - 248, $.greaterThan(k, $.lit<number>(0))))
    {
      var from = AO__ToString($, ($.subtract((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<unknown>));
      var to = AO__ToString($, ($.subtract(($.add((k as Lifted<number>), (argCount as Lifted<number>)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<unknown>));
      var fromPresent = AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 249, $.is(fromPresent, $.lit<boolean>(true))))
      {
        var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
        AO__Set($, (O as Lifted<unknown>), (to as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
      }
      else
      {
        AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (to as Lifted<unknown>));
      }

      k = $.subtract((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    }

    var j = $.lit<number>(0);
    for (var E of items)
    {
      AO__Set($, (O as Lifted<unknown>), (AO__ToString($, (j as Lifted<unknown>)) as Lifted<unknown>), (E as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
      j = $.add((j as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
    }

  }

  AO__Set($, (O as Lifted<unknown>), ($.lit<string>("length") as Lifted<unknown>), ($.add((len as Lifted<number>), (argCount as Lifted<number>)) as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
  return $.add((len as Lifted<number>), (argCount as Lifted<number>));
}
