
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__HasProperty } from "./AO__HasProperty.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__FlattenIntoArray ($ : SpecRuntime, target : Wrapped<unknown>, source : Wrapped<unknown>, sourceLen : Wrapped<number>, start : Wrapped<number>, depth : Wrapped<unknown>, mapperFunction : Wrapped<unknown> = $.undef, thisArg : Wrapped<unknown> = $.undef) {
  var mapperFunctionIsPresent = arguments.length > 6;
  var targetIndex = start;
  var sourceIndex = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 34, $.lessThan(sourceIndex, sourceLen)))
  {
    var P = AO__ToString($, (sourceIndex as Wrapped<unknown>));
    var exists = AO__HasProperty($, (source as Wrapped<unknown>), (P as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 35, $.is(exists, $.base<boolean>(true, []))))
    {
      var element = AO__Get($, (source as Wrapped<unknown>), (P as Wrapped<unknown>));
      if (mapperFunctionIsPresent)
      {
        element = AO__Call($, (mapperFunction as Wrapped<unknown>), (thisArg as Wrapped<unknown>), ([element, sourceIndex, source] as Wrapped<unknown>[]));
      }

      var shouldFlatten = $.base<boolean>(false, []);
      if ($.condition(Number.MAX_SAFE_INTEGER - 36, $.greaterThan(depth, $.base<number>(0, []))))
      {
        shouldFlatten = AO__IsArray($, (element as Wrapped<unknown>));
      }

      if ($.condition(Number.MAX_SAFE_INTEGER - 37, $.is(shouldFlatten, $.base<boolean>(true, []))))
      {
        if ($.condition(Number.MAX_SAFE_INTEGER - 38, $.is(depth, $.base<number>(Infinity, []))))
        {
          var newDepth = $.base<number>(Infinity, []);
        }
        else
        {
          var newDepth = $.subtract((depth as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
        }

        var elementLen = AO__LengthOfArrayLike($, (element as Wrapped<unknown>));
        targetIndex = AO__FlattenIntoArray($, (target as Wrapped<unknown>), (element as Wrapped<unknown>), (elementLen as Wrapped<number>), (targetIndex as Wrapped<number>), (newDepth as Wrapped<unknown>));
      }
      else
      {
        if ($.condition(Number.MAX_SAFE_INTEGER - 39, $.greaterThanEqual(targetIndex, $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)))))
        {
          throw new TypeError;
        }

        AO__CreateDataPropertyOrThrow($, (target as Wrapped<unknown>), (AO__ToString($, (targetIndex as Wrapped<unknown>)) as Wrapped<unknown>), (element as Wrapped<unknown>));
        targetIndex = $.add((targetIndex as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
      }

    }

    sourceIndex = $.add((sourceIndex as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return targetIndex;
}
