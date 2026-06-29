// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__FlattenIntoArray } from "./AO__FlattenIntoArray.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_flat ($ : SpecRuntime, $this : Lifted<unknown>, depth : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var sourceLen = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var depthNum = $.default<number>(1, []);
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 149, $.is(depth, $.default<undefined>(undefined, [])))))
  {
    depthNum = AO__ToIntegerOrInfinity($, (depth as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 150, $.lessThan(depthNum, $.default<number>(0, [])))))
    {
      depthNum = $.default<number>(0, []);
    }

  }

  var A = AO__ArraySpeciesCreate($, (O as Lifted<unknown>), ($.default<number>(0, []) as Lifted<number>));
  AO__FlattenIntoArray($, (A as Lifted<unknown>), (O as Lifted<unknown>), (sourceLen as Lifted<number>), ($.default<number>(0, []) as Lifted<number>), (depthNum as Lifted<unknown>));
  return A;
}
