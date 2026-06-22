// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

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

export function INTRINSICS_JSON_stringify ($ : SpecRuntime, $this : Wrapped<unknown>, value : Wrapped<unknown>, replacer : Wrapped<unknown> = $.undef, space : Wrapped<unknown> = $.undef) {
  var stack = [] as Wrapped<never>[];
  var indent = $.base<string>("", []);
  var PropertyList = $.base<undefined>(undefined, []);
  var ReplacerFunction = $.base<undefined>(undefined, []);
  if (($.isType(replacer, "object")))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 245, $.is(AO__IsCallable($, (replacer as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      ReplacerFunction = replacer;
    }
    else
    {
      var isArray = AO__IsArray($, (replacer as Wrapped<unknown>));
      if ($.condition(Number.MAX_SAFE_INTEGER - 246, $.is(isArray, $.base<boolean>(true, []))))
      {
        PropertyList = [] as Wrapped<never>[];
        var len = AO__LengthOfArrayLike($, (replacer as Wrapped<unknown>));
        var k = $.base<number>(0, []);
        while ($.condition(Number.MAX_SAFE_INTEGER - 247, $.lessThan(k, len)))
        {
          var prop = AO__ToString($, (k as Wrapped<unknown>));
          var v = AO__Get($, (replacer as Wrapped<unknown>), (prop as Wrapped<unknown>));
          var item = $.base<undefined>(undefined, []);
          if (($.isType(v, "string")))
          {
            item = v;
          }
          else
          {
            if (($.isType(v, "number")))
            {
              item = AO__ToString($, (v as Wrapped<unknown>));
            }
            else
            {
              if (($.isType(v, "object")))
              {
                if ($.peek(v) instanceof String || $.peek(v) instanceof Number) { item = AO__ToString($, (v as Wrapped<unknown>)); }
              }

            }

          }

          if (!$.condition(Number.MAX_SAFE_INTEGER - 248, $.is(item, $.base<undefined>(undefined, []))) && !$.contains(PropertyList, item))
          {
            $.append(PropertyList, item)
          }

          k = $.add((k as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
        }

      }

    }

  }

  if (($.isType(space, "object")))
  {
    if (($.peek(space) instanceof Number))
    {
      space = AO__ToNumber($, (space as Wrapped<unknown>));
    }
    else
    {
      if (($.peek(space) instanceof String))
      {
        space = AO__ToString($, (space as Wrapped<unknown>));
      }

    }

  }

  if (($.isType(space, "number")))
  {
    var spaceMV = AO__ToIntegerOrInfinity($, (space as Wrapped<unknown>));
    spaceMV = $.min($.base<number>(10, []), spaceMV);
    if ($.condition(Number.MAX_SAFE_INTEGER - 249, $.lessThan(spaceMV, $.base<number>(1, []))))
    {
      var gap = $.base<string>("", []);
    }
    else
    {
      var gap = $.base<string>(" ".repeat($.peek(spaceMV)), [spaceMV]);
    }

  }
  else
  {
    if (($.isType(space, "string")))
    {
      if ($.condition(Number.MAX_SAFE_INTEGER - 250, $.lessThanEqual($.length(space), $.base<number>(10, []))))
      {
        var gap = space;
      }
      else
      {
        var gap = $.substring(space, ($.base<number>(0, []) as Wrapped<number>), ($.base<number>(10, []) as Wrapped<number>));
      }

    }
    else
    {
      var gap = $.base<string>("", []);
    }

  }

  var wrapper = AO__OrdinaryObjectCreate($, (Object.prototype as Wrapped<unknown>));
  AO__CreateDataPropertyOrThrow($, (wrapper as Wrapped<unknown>), ($.base<string>("", []) as Wrapped<unknown>), (value as Wrapped<unknown>));
  var state = {"ReplacerFunction": ReplacerFunction, "Stack": stack, "Indent": indent, "Gap": gap, "PropertyList": PropertyList};
  return AO__SerializeJSONProperty($, (state as Wrapped<unknown>), ($.base<string>("", []) as Wrapped<string>), (wrapper as Wrapped<unknown>));
}
