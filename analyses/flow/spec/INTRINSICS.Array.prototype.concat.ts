// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsConcatSpreadable } from "./AO__IsConcatSpreadable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_concat ($ : SpecRuntime, $this : Lifted<unknown>, ...items : Lifted<unknown>[]) {
  var O = AO__ToObject($, $this);
  var A = AO__ArraySpeciesCreate($, (O as Lifted<unknown>), ($.default<number>(0, []) as Lifted<number>));
  var n = $.default<number>(0, []);
  $.prepend(items, O)
  for (var E of items)
  {
    var spreadable = AO__IsConcatSpreadable($, (E as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 119, $.is(spreadable, $.default<boolean>(true, [])))))
    {
      var len = AO__LengthOfArrayLike($, (E as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 120, $.greaterThan($.add((n as Lifted<number>), (len as Lifted<number>)), $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
      {
        throw new TypeError;
      }

      var k = $.default<number>(0, []);
      while ($.value($.condition(Number.MAX_SAFE_INTEGER - 121, $.lessThan(k, len))))
      {
        var Pk = AO__ToString($, (k as Lifted<unknown>));
        var exists = AO__HasProperty($, (E as Lifted<unknown>), (Pk as Lifted<unknown>));
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 122, $.is(exists, $.default<boolean>(true, [])))))
        {
          var subElement = AO__Get($, (E as Lifted<unknown>), (Pk as Lifted<unknown>));
          AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (AO__ToString($, (n as Lifted<unknown>)) as Lifted<unknown>), (subElement as Lifted<unknown>));
        }

        n = $.add((n as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
        k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
      }

    }
    else
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 123, $.greaterThanEqual(n, $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
      {
        throw new TypeError;
      }

      AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (AO__ToString($, (n as Lifted<unknown>)) as Lifted<unknown>), (E as Lifted<unknown>));
      n = $.add((n as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

  }

  AO__Set($, (A as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (n as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return A;
}
