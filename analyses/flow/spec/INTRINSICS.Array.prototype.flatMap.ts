// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArraySpeciesCreate } from "./AO__ArraySpeciesCreate.js";
import { AO__FlattenIntoArray } from "./AO__FlattenIntoArray.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_flatMap ($ : SpecRuntime, $this : Lifted<unknown>, mapperFunction : Lifted<unknown>, thisArg : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var O = AO__ToObject($, $this);
  var sourceLen = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 151, $.is(AO__IsCallable($, (mapperFunction as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  var A = AO__ArraySpeciesCreate($, (O as Lifted<unknown>), ($.default<number>(0, []) as Lifted<number>));
  AO__FlattenIntoArray($, (A as Lifted<unknown>), (O as Lifted<unknown>), (sourceLen as Lifted<number>), ($.default<number>(0, []) as Lifted<number>), ($.default<number>(1, []) as Lifted<unknown>), (mapperFunction as Lifted<unknown>), (thisArg as Lifted<unknown>));
  return A;
}
