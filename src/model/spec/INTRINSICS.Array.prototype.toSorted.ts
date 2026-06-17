
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CompareArrayElements } from "./AO__CompareArrayElements.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SortIndexedProperties } from "./AO__SortIndexedProperties.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_toSorted ($ : SpecRuntime, $this : Wrapped<unknown>, comparator : Wrapped<unknown>) {
  if (!$.condition(Number.MAX_SAFE_INTEGER - 210, $.is(comparator, $.base<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 211, $.is(AO__IsCallable($, (comparator as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  var O = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (O as Wrapped<unknown>));
  var A = AO__ArrayCreate($, (len as Wrapped<number>));
  var SortCompare = (() => {var _self = (x, y) => {
  return AO__CompareArrayElements($, (x as Wrapped<unknown>), (y as Wrapped<unknown>), (comparator as Wrapped<unknown>));
}
; return _self;})();
  var sortedList = AO__SortIndexedProperties($, (O as Wrapped<unknown>), (len as Wrapped<number>), (SortCompare as Wrapped<unknown>), ($.base<string>("read-through-holes", []) as Wrapped<unknown>));
  var j = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 212, $.lessThan(j, len)))
  {
    AO__CreateDataPropertyOrThrow($, (A as Wrapped<unknown>), (AO__ToString($, (j as Wrapped<unknown>)) as Wrapped<unknown>), (sortedList[j] as Wrapped<unknown>));
    j = $.add((j as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return A;
}
