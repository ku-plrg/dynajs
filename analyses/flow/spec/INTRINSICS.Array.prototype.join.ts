// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_join ($ : SpecRuntime, $this : Lifted<unknown>, separator : Lifted<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 164, $.is(separator, $.default<undefined>(undefined, [])))))
  {
    var sep = $.default<string>(",", []);
  }
  else
  {
    var sep = AO__ToString($, (separator as Lifted<unknown>));
  }

  var R = $.default<string>("", []);
  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 165, $.lessThan(k, len))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 166, $.greaterThan(k, $.default<number>(0, [])))))
    {
      R = $.concatenate(R, sep);
    }

    var element = AO__Get($, (O as Lifted<unknown>), (AO__ToString($, (k as Lifted<unknown>)) as Lifted<unknown>));
    if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 167, $.is(element, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 168, $.is(element, $.default<null>(null, []))))))
    {
      var S = AO__ToString($, (element as Lifted<unknown>));
      R = $.concatenate(R, S);
    }

    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return R;
}
