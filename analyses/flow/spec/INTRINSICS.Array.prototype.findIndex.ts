// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__FindViaPredicate } from "./AO__FindViaPredicate.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToObject } from "./AO__ToObject.js";

export function INTRINSICS_Array_prototype_findIndex ($ : SpecRuntime, $this : Wrapped<unknown>, predicate : Wrapped<unknown>, thisArg : Wrapped<unknown> = $.undef) {
  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var findRec = AO__FindViaPredicate($, (O as Wrapped<unknown>), (len as Wrapped<number>), ($.base<string>("ascending", []) as Wrapped<unknown>), (predicate as Wrapped<unknown>), (thisArg as Wrapped<unknown>));
  return findRec["Index" /* TODO INTERNAL : internal access */];
}
