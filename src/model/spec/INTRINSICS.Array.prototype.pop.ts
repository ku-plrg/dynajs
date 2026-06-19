// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_pop ($ : SpecRuntime, $this : Wrapped<unknown>) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 159, $.is(len, $.base<number>(0, []))))
  {
    AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    return $.base<undefined>(undefined, []);
  }
  else
  {
    var newLen = $.subtract((len as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
    var index = AO__ToString($, (newLen as Wrapped<unknown>));
    var element = AO__Get($, (O as Wrapped<unknown>), (index as Wrapped<unknown>));
    AO__DeletePropertyOrThrow($, (O as Wrapped<unknown>), (index as Wrapped<unknown>));
    AO__Set($, (O as Wrapped<unknown>), ($.base<string>("length", []) as Wrapped<unknown>), (newLen as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    return element;
  }

}
