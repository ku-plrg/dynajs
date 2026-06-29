// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__Call } from "./AO__Call.js";
import { AO__Construct } from "./AO__Construct.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__GetIteratorFromMethod } from "./AO__GetIteratorFromMethod.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__IsConstructor } from "./AO__IsConstructor.js";
import { AO__IteratorClose } from "./AO__IteratorClose.js";
import { AO__IteratorStepValue } from "./AO__IteratorStepValue.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__Set } from "./AO__Set.js";
import { AO__ToObject } from "./AO__ToObject.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_Array_from ($ : SpecRuntime, $this : Lifted<unknown>, items : Lifted<unknown>, mapper : Lifted<unknown> = $.default<undefined>(undefined, []), thisArg : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var C = $this;
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 102, $.is(mapper, $.default<undefined>(undefined, [])))))
  {
    var mapping = $.default<boolean>(false, []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 103, $.is(AO__IsCallable($, (mapper as Lifted<unknown>)), $.default<boolean>(false, [])))))
    {
      throw new TypeError;
    }

    var mapping = $.default<boolean>(true, []);
  }

  var usingIterator = AO__GetMethod($, (items as Lifted<unknown>), ($.default<symbol>(Symbol.iterator, []) as Lifted<unknown>));
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 104, $.is(usingIterator, $.default<undefined>(undefined, [])))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 105, $.is(AO__IsConstructor($, (C as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      var A = AO__Construct($, (C as Lifted<unknown>));
    }
    else
    {
      var A = AO__ArrayCreate($, ($.default<number>(0, []) as Lifted<number>));
    }

    var iteratorRecord = AO__GetIteratorFromMethod($, (items as Lifted<unknown>), (usingIterator as Lifted<unknown>));
    var k = $.default<number>(0, []);
    while (true)
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 106, $.greaterThanEqual(k, $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>))))))
      {
        var error = new TypeError();
        var error_kind = $.default<string>("abrupt", []);
        return AO__IteratorClose($, (iteratorRecord as Lifted<unknown>), (error_kind as Lifted<unknown>), error);
      }

      var Pk = AO__ToString($, (k as Lifted<unknown>));
      var next = AO__IteratorStepValue($, (iteratorRecord as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 107, $.is(next, $.default<string>("done", [])))))
      {
        AO__Set($, (A as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (k as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
        return A;
      }

      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 108, $.is(mapping, $.default<boolean>(true, [])))))
      {
        try
        {
          var mappedValue = AO__Call($, (mapper as Lifted<unknown>), (thisArg as Lifted<unknown>), ([next, k] as Lifted<unknown>[]));
          var mappedValue_kind = $.default<string>("normal", []);
        }
        catch(_mappedValue_err)
        {
          mappedValue = _mappedValue_err;
          var mappedValue_kind = $.default<string>("abrupt", []);
        }

        if ($.value($.condition(Number.MAX_SAFE_INTEGER - 109, $.is(mappedValue_kind, $.default<string>("abrupt", [])))))
        {
          return AO__IteratorClose($, (iteratorRecord as Lifted<unknown>), (mappedValue_kind as Lifted<unknown>), mappedValue);
        }
        else
        {
          mappedValue = mappedValue;
        }

      }
      else
      {
        var mappedValue = next;
      }

      try
      {
        var defineStatus = AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pk as Lifted<unknown>), (mappedValue as Lifted<unknown>));
        var defineStatus_kind = $.default<string>("normal", []);
      }
      catch(_defineStatus_err)
      {
        defineStatus = _defineStatus_err;
        var defineStatus_kind = $.default<string>("abrupt", []);
      }

      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 110, $.is(defineStatus_kind, $.default<string>("abrupt", [])))))
      {
        return AO__IteratorClose($, (iteratorRecord as Lifted<unknown>), (defineStatus_kind as Lifted<unknown>), defineStatus);
      }
      else
      {
        defineStatus = defineStatus;
      }

      k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
    }

  }

  var arrayLike = AO__ToObject($, items);
  var len = AO__LengthOfArrayLike($, (arrayLike as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 111, $.is(AO__IsConstructor($, (C as Lifted<unknown>)), $.default<boolean>(true, [])))))
  {
    var A = AO__Construct($, (C as Lifted<unknown>), ([len] as Lifted<unknown>[]));
  }
  else
  {
    var A = AO__ArrayCreate($, (len as Lifted<number>));
  }

  var k = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 112, $.lessThan(k, len))))
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kValue = AO__Get($, (arrayLike as Lifted<unknown>), (Pk as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 113, $.is(mapping, $.default<boolean>(true, [])))))
    {
      var mappedValue = AO__Call($, (mapper as Lifted<unknown>), (thisArg as Lifted<unknown>), ([kValue, k] as Lifted<unknown>[]));
    }
    else
    {
      var mappedValue = kValue;
    }

    AO__CreateDataPropertyOrThrow($, (A as Lifted<unknown>), (Pk as Lifted<unknown>), (mappedValue as Lifted<unknown>));
    k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  AO__Set($, (A as Lifted<unknown>), ($.default<string>("length", []) as Lifted<unknown>), (len as Lifted<unknown>), ($.default<boolean>(true, []) as Lifted<boolean>));
  return A;
}
