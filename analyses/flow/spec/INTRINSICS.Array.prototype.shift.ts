// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_shift ($ : SpecRuntime, $this : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 202, $.is(len, $.lit<number>(0))))
  {
    AO__Set($, (O as Lifted<unknown>), ($.lit<string>("length") as Lifted<unknown>), ($.lit<number>(0) as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
    return $.lit<undefined>(undefined);
  }

  var first = AO__Get($, (O as Lifted<unknown>), ($.lit<string>("0") as Lifted<unknown>));
  var k = $.lit<number>(1);
  while ($.condition(Number.MAX_SAFE_INTEGER - 203, $.lessThan(k, len)))
  {
    var from = AO__ToString($, (k as Lifted<unknown>));
    var to = AO__ToString($, ($.subtract((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<unknown>));
    var fromPresent = AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 204, $.is(fromPresent, $.lit<boolean>(true))))
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
      AO__Set($, (O as Lifted<unknown>), (to as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (to as Lifted<unknown>));
    }

    k = $.add((k as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }

  AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (AO__ToString($, ($.subtract((len as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<unknown>)) as Lifted<unknown>));
  AO__Set($, (O as Lifted<unknown>), ($.lit<string>("length") as Lifted<unknown>), ($.subtract((len as Lifted<number>), ($.lit<number>(1) as Lifted<number>)) as Lifted<unknown>), ($.lit<boolean>(true) as Lifted<boolean>));
  return first;
}
