// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CompareArrayElements } from "./AO__CompareArrayElements.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SortIndexedProperties } from "./AO__SortIndexedProperties.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toSorted ($ : SpecRuntime, $this : Lifted<unknown>, comparator : Lifted<unknown>) {
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 246, $.is(comparator, $.default<undefined>(undefined, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 247, $.is(AO__IsCallable($, (comparator as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Lifted<unknown>));
  var A = AO__ArrayCreate($, (len as Lifted<number>));
  var SortCompare = (() => {var _self = $.default<Unlifted<Function>>( /* ABSTRACT_CLOSURE */ (x, y) => {
  return AO__CompareArrayElements($, (x as Lifted<unknown>), (y as Lifted<unknown>), (comparator as Lifted<unknown>));
}
 , [comparator]); return _self as Lifted<Function>;})() as Lifted<Function>;
  var sortedList = AO__SortIndexedProperties($, (O as Lifted<unknown>), (len as Lifted<number>), (SortCompare as Lifted<unknown>), ($.default<string>("read-through-holes", []) as Lifted<unknown>));
  var j = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 248, $.lessThan(j, len))))
  {
    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (AO__ToString($, (j as Lifted<unknown>)) as Lifted<unknown>), (sortedList[j] as Lifted<unknown>));
    j = $.add((j as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return A;
}
