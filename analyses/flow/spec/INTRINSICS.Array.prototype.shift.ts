// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

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
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 211, $.is(len, $.default<number>(0, [])))))
  {
    AO__Set($, (O as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), ($.default<number>(0, []) as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    return $.default<undefined>(undefined, []);
  }

  var first = AO__Get($, (O as Lifted<unknown>), ($.default<string>("0", []) as Lifted<unknown>));
  var k = $.default<number>(1, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 212, $.lessThan(k, len))))
  {
    var from = AO__ToString($, (k as Lifted<unknown>));
    var to = AO__ToString($, ($.subtract((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>));
    var fromPresent = AO__HasProperty($, (O as Lifted<unknown>), (from as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 213, $.is(fromPresent, $.default<boolean>(true, [])))))
    {
      var fromValue = AO__Get($, (O as Lifted<unknown>), (from as Lifted<unknown>));
      AO__Set($, (O as Lifted<unknown>), (to as Lifted<unknown>), (fromValue as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    }
    else
    {
      AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (to as Lifted<unknown>));
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__DeletePropertyOrThrow($, (O as Lifted<unknown>), (AO__ToString($, ($.subtract((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>)) as Lifted<unknown>));
  AO__Set($, (O as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), ($.subtract((len as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)) as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return first;
}
