// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__FindViaPredicate } from "./AO__FindViaPredicate.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_findLast ($ : SpecRuntime, $this : Lifted<unknown>, predicate : Lifted<unknown>, thisArg : Lifted<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var findRec = AO__FindViaPredicate($, (O as Lifted<unknown>), (len as Lifted<number>), ($.lit<string>("descending") as Lifted<unknown>), (predicate as Lifted<unknown>), (thisArg as Lifted<unknown>));
  return findRec["Value" /* TODO INTERNAL : internal access */];
}
