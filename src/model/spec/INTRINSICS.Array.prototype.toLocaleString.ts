
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__Invoke } from "./AO__Invoke.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toLocaleString ($ : SpecRuntime, $this : Wrapped<unknown>, reserved1 : Wrapped<unknown> = $.undef, reserved2 : Wrapped<unknown> = $.undef) {
  var array = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (array as Wrapped<unknown>));
  throw new Error("YET: Let _separator_ be the implementation-defined list-separator String value appropriate for the host environment's current locale (such as *\", \"*).")
  var R = $.base<string>("", []);
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 205, $.lessThan(k, len)))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 206, $.greaterThan(k, $.base<number>(0, []))))
    {
      R = $.concatenate(R, separator);
    }

    var element = AO__Get($, (array as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>));
    if (!($.condition(Number.MAX_SAFE_INTEGER - 207, $.is(element, $.base<undefined>(undefined, []))) || $.condition(Number.MAX_SAFE_INTEGER - 208, $.is(element, $.base<null>(null, [])))))
    {
      var S = AO__ToString($, (AO__Invoke($, (element as Wrapped<unknown>), ($.base<string>("toLocaleString", []) as Wrapped<unknown>)) as Wrapped<unknown>));
      R = $.concatenate(R, S);
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return R;
}
