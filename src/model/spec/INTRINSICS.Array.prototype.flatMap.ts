
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__FlattenIntoArray } from "./AO__FlattenIntoArray.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_flatMap ($ : SpecRuntime, $this : Wrapped<unknown>, mapperFunction : Wrapped<unknown>, thisArg : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var sourceLen = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 115, $.is(AO__IsCallable($, (mapperFunction as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  var A = AO__ArraySpeciesCreate($, (O as Wrapped<unknown>), ($.base<number>(0, []) as Wrapped<number>));
  AO__FlattenIntoArray($, (A as Wrapped<unknown>), (O as Wrapped<unknown>), (sourceLen as Wrapped<number>), ($.base<number>(0, []) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<unknown>), (mapperFunction as Wrapped<unknown>), (thisArg as Wrapped<unknown>));
  return A;
}
