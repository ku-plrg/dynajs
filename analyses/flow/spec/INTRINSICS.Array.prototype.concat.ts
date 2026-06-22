// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsConcatSpreadable } from "./AO__IsConcatSpreadable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_concat ($ : SpecRuntime, $this : Wrapped<unknown>, ...items : Wrapped<unknown>[]) {
  var O = AO__ToObject($, $this);
  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<number>));
  var n = $.base<number>(0, []);
  $.prepend(items, O)
  for (var E of items)
  {
    var spreadable = AO__IsConcatSpreadable($, (E as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 101, $.is(spreadable, $.base<boolean>(true, []))))
    {
      var len = AO__LengthOfArrayLike($, (E as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 102, $.greaterThan($.add((n as Wrapped<number>), (len as Wrapped<number>)), $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
      {
        throw new TypeError;
      }

      var k = $.base<number>(0, []);
      while ($.condition(Number.MAX_SAFE_INTEGER - 103, $.lessThan(k, len)))
      {
        var Pk = AO__ToString($, (k as Wrapped<unknown>));
        var exists = AO__HasProperty($, (E as Wrapped<unknown>), (Pk as Wrapped<unknown>));
        if ($.condition(Number.MAX_SAFE_INTEGER - 104, $.is(exists, $.base<boolean>(true, []))))
        {
          var subElement = AO__Get($, (E as Wrapped<unknown>), (Pk as Wrapped<unknown>));
          AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (n as Wrapped<unknown>)) as Wrapped<unknown>), (subElement as Wrapped<unknown>));
        }

        n = $.add((n as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
        k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
      }

    }
    else
    {
      if ($.condition(Number.MAX_SAFE_INTEGER - 105, $.greaterThanEqual(n, $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
      {
        throw new TypeError;
      }

      AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (n as Wrapped<unknown>)) as Wrapped<unknown>), (E as Wrapped<unknown>));
      n = $.add((n as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    }

  }

  AO__Set($, (A as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), (n as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  return A;
}
