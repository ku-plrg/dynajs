// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__FlattenIntoArray ($ : SpecRuntime, target : Lifted<unknown>, source : Lifted<unknown>, sourceLen : Lifted<number>, start : Lifted<number>, depth : Lifted<unknown>, mapperFunction : Lifted<unknown> = $.default<undefined>(undefined, []), thisArg : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var mapperFunctionIsPresent = arguments.length > 6;
  var targetIndex = start;
  var sourceIndex = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 55, $.lessThan(sourceIndex, sourceLen))))
  {
    var P = AO__ToString($, (sourceIndex as Lifted<unknown>));
    var exists = AO__HasProperty($, (source as Lifted<unknown>), (P as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 56, $.is(exists, $.default<boolean>(true, [])))))
    {
      var element = AO__Get($, (source as Lifted<unknown>), (P as Lifted<unknown>));
      if (mapperFunctionIsPresent)
      {
        element = AO__Call($, (mapperFunction as Lifted<unknown>), (thisArg as Lifted<unknown>), ([element, sourceIndex, source] as Lifted<unknown>[]));
      }

      var shouldFlatten = $.default<boolean>(false, []);
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 57, $.greaterThan(depth, $.default<number>(0, [])))))
      {
        shouldFlatten = AO__IsArray($, (element as Lifted<unknown>));
      }

      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 58, $.is(shouldFlatten, $.default<boolean>(true, [])))))
      {
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 59, $.is(depth, $.default<number>(Infinity, [])))))
        {
          var newDepth = $.default<number>(Infinity, []);
        }
        else
        {
          var newDepth = $.subtract((depth as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
        }

        var elementLen = AO__LengthOfArrayLike($, (element as Lifted<unknown>));
        targetIndex = AO__FlattenIntoArray($, (target as Lifted<unknown>), (element as Lifted<unknown>), (elementLen as Lifted<number>), (targetIndex as Lifted<number>), (newDepth as Lifted<unknown>));
      }
      else
      {
        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 60, $.greaterThanEqual(targetIndex, $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
        {
          throw new TypeError;
        }

        AO__CreateDataPropertyOrThrow($, (target as Lifted<unknown>), (AO__ToString($, (targetIndex as Lifted<unknown>)) as Lifted<unknown>), (element as Lifted<unknown>));
        targetIndex = $.add((targetIndex as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
      }

    }

    sourceIndex = $.add((sourceIndex as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return targetIndex;
}
