
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_reverse ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var middle = $.floor($.divide((len as Wrapped<number>), ($.base<number>(2, []) as Wrapped<number>)));
  var lower = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 166, $.isNot(lower, middle)))
  {
    var upper = $.subtract(($.subtract((len as Wrapped<number>), (lower as Wrapped<number>)) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    var upperP = AO__ToString($, (upper as Wrapped<unknown>));
    var lowerP = AO__ToString($, (lower as Wrapped<unknown>));
    var lowerExists = AO__HasProperty($, (O as Wrapped<unknown>), (lowerP as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 167, $.is(lowerExists, $.base<boolean>(true, []))))
    {
      var lowerValue = AO__Get($, (O as Wrapped<unknown>), (lowerP as Wrapped<unknown>));
    }

    var upperExists = AO__HasProperty($, (O as Wrapped<unknown>), (upperP as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 168, $.is(upperExists, $.base<boolean>(true, []))))
    {
      var upperValue = AO__Get($, (O as Wrapped<unknown>), (upperP as Wrapped<unknown>));
    }

    if ($.condition(Number.MAX_SAFE_INTEGER - 169, $.is(lowerExists, $.base<boolean>(true, []))) && $.condition(Number.MAX_SAFE_INTEGER - 170, $.is(upperExists, $.base<boolean>(true, []))))
    {
      AO__Set($, (O as Wrapped<unknown>), (lowerP as Wrapped<unknown>), (upperValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
      AO__Set($, (O as Wrapped<unknown>), (upperP as Wrapped<unknown>), (lowerValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    }
    else
    {
      if ($.condition(Number.MAX_SAFE_INTEGER - 171, $.is(lowerExists, $.base<boolean>(false, []))) && $.condition(Number.MAX_SAFE_INTEGER - 172, $.is(upperExists, $.base<boolean>(true, []))))
      {
        AO__Set($, (O as Wrapped<unknown>), (lowerP as Wrapped<unknown>), (upperValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
        AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (upperP as Wrapped<unknown>));
      }
      else
      {
        if ($.condition(Number.MAX_SAFE_INTEGER - 173, $.is(lowerExists, $.base<boolean>(true, []))) && $.condition(Number.MAX_SAFE_INTEGER - 174, $.is(upperExists, $.base<boolean>(false, []))))
        {
          AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (lowerP as Wrapped<unknown>));
          AO__Set($, (O as Wrapped<unknown>), (upperP as Wrapped<unknown>), (lowerValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
        }
        else
        {
        }

      }

    }

    lower = $.add((lower as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return O;
}
