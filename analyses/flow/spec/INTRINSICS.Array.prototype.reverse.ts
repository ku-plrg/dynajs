// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_reverse ($ : SpecRuntime, $this : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var middle = $.floor($.divide((len as Lifted<number>), ($.default<number>(2, []) as Lifted<number>)));
  var lower = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 202, $.isNot(lower, middle))))
  {
    var upper = $.subtract(($.subtract((len as Lifted<number>), (lower as Lifted<number>)) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    var upperP = AO__ToString($, (upper as Lifted<unknown>));
    var lowerP = AO__ToString($, (lower as Lifted<unknown>));
    var lowerExists = AO__HasProperty($, (O as Lifted<unknown>), (lowerP as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 203, $.is(lowerExists, $.default<boolean>(true, [])))))
    {
      var lowerValue = AO__Get($, (O as Lifted<unknown>), (lowerP as Lifted<unknown>));
    }

    var upperExists = AO__HasProperty($, (O as Lifted<unknown>), (upperP as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 204, $.is(upperExists, $.default<boolean>(true, [])))))
    {
      var upperValue = AO__Get($, (O as Lifted<unknown>), (upperP as Lifted<unknown>));
    }

    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 205, $.is(lowerExists, $.default<boolean>(true, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 206, $.is(upperExists, $.default<boolean>(true, [])))))
    {
      AO__Set($, (O as Lifted<unknown>), (lowerP as Lifted<unknown>), (upperValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
      AO__Set($, (O as Lifted<unknown>), (upperP as Lifted<unknown>), (lowerValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    }
    else
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 207, $.is(lowerExists, $.default<boolean>(false, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 208, $.is(upperExists, $.default<boolean>(true, [])))))
      {
        AO__Set($, (O as Lifted<unknown>), (lowerP as Lifted<unknown>), (upperValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
        AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (upperP as Lifted<unknown>));
      }
      else
      {
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 209, $.is(lowerExists, $.default<boolean>(true, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 210, $.is(upperExists, $.default<boolean>(false, [])))))
        {
          AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (lowerP as Lifted<unknown>));
          AO__Set($, (O as Lifted<unknown>), (upperP as Lifted<unknown>), (lowerValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
        }
        else
        {
        }

      }

    }

    lower = $.add((lower as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return O;
}
