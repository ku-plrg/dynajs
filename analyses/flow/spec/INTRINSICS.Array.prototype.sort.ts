// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CompareArrayElements } from "./AO__CompareArrayElements.js";
import { AO__DeletePropertyOrThrow } from "./AO__DeletePropertyOrThrow.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__SortIndexedProperties } from "./AO__SortIndexedProperties.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_prototype_sort ($ : SpecRuntime, $this : Lifted<unknown>, comparator : Lifted<unknown>) {
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 225, $.is(comparator, $.default<undefined>(undefined, [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 226, $.is(AO__IsCallable($, (comparator as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  var obj = AO__ToObject($, $this);
  var len = AO__LengthOfArrayLike($, (obj as Lifted<unknown>));
  var SortCompare = (() => {var _self = $.default<Unlifted<Function>>( /* ABSTRACT_CLOSURE */ (x, y) => {
  return AO__CompareArrayElements($, (x as Lifted<unknown>), (y as Lifted<unknown>), (comparator as Lifted<unknown>));
}
 , [comparator]); return _self as Lifted<Function>;})() as Lifted<Function>;
  var sortedList = AO__SortIndexedProperties($, (obj as Lifted<unknown>), (len as Lifted<number>), (SortCompare as Lifted<unknown>), ($.default<string>("skip-holes", []) as Lifted<unknown>));
  var itemCount = $.default<number>(sortedList.length, []);
  var j = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 227, $.lessThan(j, itemCount))))
  {
    AO__Set($, (obj as Lifted<unknown>), (AO__ToString($, (j as Lifted<unknown>)) as Lifted<unknown>), (sortedList[j] as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
    j = $.add((j as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 228, $.lessThan(j, len))))
  {
    AO__DeletePropertyOrThrow($, (obj as Lifted<unknown>), (AO__ToString($, (j as Lifted<unknown>)) as Lifted<unknown>));
    j = $.add((j as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return obj;
}
