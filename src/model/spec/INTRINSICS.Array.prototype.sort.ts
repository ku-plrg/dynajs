
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CompareArrayElements } from "./AO__CompareArrayElements.js";
import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__SortIndexedProperties } from "./AO__SortIndexedProperties.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_sort ($ : SpecRuntime, $this : Wrapped<unknown>, comparator : Wrapped<unknown>) {
  if (!$.condition(Number.MAX_SAFE_INTEGER - 189, $.is(comparator, $.base<undefined>(undefined, []))) && $.condition(Number.MAX_SAFE_INTEGER - 190, $.is(AO__IsCallable($, (comparator as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  var obj = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (obj as Wrapped<unknown>));
  var SortCompare = (() => {var _self = (x, y) => {
  return AO__CompareArrayElements($, (x as Wrapped<unknown>), (y as Wrapped<unknown>), (comparator as Wrapped<unknown>));
}
; return _self;})();
  var sortedList = AO__SortIndexedProperties($, (obj as Wrapped<unknown>), (len as Wrapped<number>), (SortCompare as Wrapped<unknown>), ($.base<string>("skip-holes", []) as Wrapped<unknown>));
  var itemCount = $.base<number>(sortedList.length, []);
  var j = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 191, $.lessThan(j, itemCount)))
  {
    AO__Set($, (obj as Wrapped<unknown>), (AO__ToString($, (j as Wrapped<unknown>)) as Wrapped<unknown>), (sortedList[j] as Wrapped<unknown>), ($.base<boolean>(true, []) as Wrapped<boolean>));
    j = $.add((j as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  while ($.condition(Number.MAX_SAFE_INTEGER - 192, $.lessThan(j, len)))
  {
    AO__DeletePropertyOrThrow($, (obj as Wrapped<unknown>), (AO__ToString($, (j as Wrapped<unknown>)) as Wrapped<unknown>));
    j = $.add((j as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return obj;
}
