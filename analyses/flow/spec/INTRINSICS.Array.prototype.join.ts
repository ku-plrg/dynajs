// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_join ($ : SpecRuntime, $this : Wrapped<unknown>, separator : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 151, $.is(separator, $.base<undefined>(undefined, []))))
  {
    var sep = $.base<string>(",", []);
  }
  else
  {
    var sep = AO__ToString($, (separator as Wrapped<unknown>));
  }

  var R = $.base<string>("", []);
  var k = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 152, $.lessThan(k, len)))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 153, $.greaterThan(k, $.base<number>(0, []))))
    {
      R = $.concatenate(R, sep);
    }

    var element = AO__Get($, (O as Wrapped<unknown>), (AO__ToString($, (k as Wrapped<unknown>)) as Wrapped<unknown>));
    if (!($.condition(Number.MAX_SAFE_INTEGER - 154, $.is(element, $.base<undefined>(undefined, []))) || $.condition(Number.MAX_SAFE_INTEGER - 155, $.is(element, $.base<null>(null, [])))))
    {
      var S = AO__ToString($, (element as Wrapped<unknown>));
      R = $.concatenate(R, S);
    }

    k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return R;
}
