// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_shift ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 179, $.is(len, $.base<number>(0, []))))
  {
    AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    return $.base<undefined>(undefined, []);
  }

  var first = AO__Get($, (O as Wrapped<unknown>), ($.base<string>("0", []) as Wrapped<unknown>));
  var k = $.base<number>(1, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 180, $.lessThan(k, len)))
  {
    var from = AO__ToString($, (k as Wrapped<unknown>));
    var to = AO__ToString($, ($.subtract((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>));
    var fromPresent = AO__HasProperty($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 181, $.is(fromPresent, $.base<boolean>(true, []))))
    {
      var fromValue = AO__Get($, (O as Wrapped<unknown>), (from as Wrapped<unknown>));
      AO__Set($, (O as Wrapped<unknown>), (to as Wrapped<unknown>), (fromValue as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (to as Wrapped<unknown>));
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (AO__ToString($, ($.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>)) as Wrapped<unknown>));
  AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), ($.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)) as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
  return first;
}
