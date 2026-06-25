// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__OrdinaryObjectCreate } from "./AO__OrdinaryObjectCreate.js";
import { AO__SerializeJSONProperty } from "./AO__SerializeJSONProperty.js";
import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_JSON_stringify ($ : SpecRuntime, $this : Lifted<unknown>, value : Lifted<unknown>, replacer : Lifted<unknown> = $.default<undefined>(undefined, []), space : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  var stack = [] as Lifted<never>[];
  var indent = $.default<string>("", []);
  var PropertyList = $.default<undefined>(undefined, []);
  var ReplacerFunction = $.default<undefined>(undefined, []);
  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 255, $.isType(replacer, "object")))))
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 256, $.is(AO__IsCallable($, (replacer as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      ReplacerFunction = replacer;
    }
    else
    {
      var isArray = AO__IsArray($, (replacer as Lifted<unknown>));
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 257, $.is(isArray, $.default<boolean>(true, [])))))
      {
        PropertyList = [] as Lifted<never>[];
        var len = AO__LengthOfArrayLike($, (replacer as Lifted<unknown>));
        var k = $.default<number>(0, []);
        while ($.value($.condition(Number.MAX_SAFE_INTEGER - 258, $.lessThan(k, len))))
        {
          var prop = AO__ToString($, (k as Lifted<unknown>));
          var v = AO__Get($, (replacer as Lifted<unknown>), (prop as Lifted<unknown>));
          var item = $.default<undefined>(undefined, []);
          if (($.value($.condition(Number.MAX_SAFE_INTEGER - 259, $.isType(v, "string")))))
          {
            item = v;
          }
          else
          {
            if (($.value($.condition(Number.MAX_SAFE_INTEGER - 260, $.isType(v, "number")))))
            {
              item = AO__ToString($, (v as Lifted<unknown>));
            }
            else
            {
              if (($.value($.condition(Number.MAX_SAFE_INTEGER - 261, $.isType(v, "object")))))
              {
                if ($.value(v) instanceof String || $.value(v) instanceof Number) { item = AO__ToString($, (v as Lifted<unknown>)); }
              }

            }

          }

          if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 262, $.is(item, $.default<undefined>(undefined, [])))) && !$.contains(PropertyList, item))
          {
            $.append(PropertyList, item)
          }

          k = $.add((k as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
        }

      }

    }

  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 263, $.isType(space, "object")))))
  {
    if (($.value(space) instanceof Number))
    {
      space = AO__ToNumber($, (space as Lifted<unknown>));
    }
    else
    {
      if (($.value(space) instanceof String))
      {
        space = AO__ToString($, (space as Lifted<unknown>));
      }

    }

  }

  if (($.value($.condition(Number.MAX_SAFE_INTEGER - 264, $.isType(space, "number")))))
  {
    var spaceMV = AO__ToIntegerOrInfinity($, (space as Lifted<unknown>));
    spaceMV = $.min($.default<number>(10, []), spaceMV);
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 265, $.lessThan(spaceMV, $.default<number>(1, [])))))
    {
      var gap = $.default<string>("", []);
    }
    else
    {
      var gap = $.default<string>(" ".repeat($.value(spaceMV)), [spaceMV]);
    }

  }
  else
  {
    if (($.value($.condition(Number.MAX_SAFE_INTEGER - 266, $.isType(space, "string")))))
    {
      if ($.value($.condition(Number.MAX_SAFE_INTEGER - 267, $.lessThanEqual($.length(space), $.default<number>(10, [])))))
      {
        var gap = space;
      }
      else
      {
        var gap = $.substring(space, ($.default<number>(0, []) as Lifted<number>), ($.default<number>(10, []) as Lifted<number>));
      }

    }
    else
    {
      var gap = $.default<string>("", []);
    }

  }

  var wrapper = AO__OrdinaryObjectCreate($, (Object.prototype as Lifted<unknown>));
  AO__CreateDataPropertyOrThrow($, (wrapper as Lifted<unknown>), ($.default<string>("", []) as Lifted<unknown>), (value as Lifted<unknown>));
  var state = {"ReplacerFunction": ReplacerFunction, "Stack": stack, "Indent": indent, "Gap": gap, "PropertyList": PropertyList};
  return AO__SerializeJSONProperty($, (state as Lifted<unknown>), ($.default<string>("", []) as Lifted<string>), (wrapper as Lifted<unknown>));
}
