
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__FlattenIntoArray } from "./AO__FlattenIntoArray.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_flat ($ : SpecRuntime, $this : Wrapped<unknown>, depth : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var sourceLen = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var depthNum = $.base<number>(1, []);
  if (!$.condition(Number.MAX_SAFE_INTEGER - 113, $.is(depth, $.base<undefined>(undefined, []))))
  {
    depthNum = AO__ToIntegerOrInfinity($, (depth as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 114, $.lessThan(depthNum, $.base<number>(0, []))))
    {
      depthNum = $.base<number>(0, []);
    }

  }

  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<number>));
  AO__FlattenIntoArray($, (A as Wrapped<unknown>), (O as Wrapped<unknown>), (sourceLen as Wrapped<number>), ($.base<number>(0, []) as Wrapped<number>), (depthNum as Wrapped<unknown>));
  return A;
}
