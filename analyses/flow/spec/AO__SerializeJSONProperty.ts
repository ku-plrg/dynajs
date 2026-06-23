// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__GetV } from "./AO__GetV.js";
import { AO__IsArray } from "./AO__IsArray.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__QuoteJSONString } from "./AO__QuoteJSONString.js";
import { AO__SerializeJSONArray } from "./AO__SerializeJSONArray.js";
import { AO__SerializeJSONObject } from "./AO__SerializeJSONObject.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__SerializeJSONProperty ($ : SpecRuntime, state : Wrapped<unknown>, key : Wrapped<string>, holder : Wrapped<unknown>) {
  var value = AO__Get($, (holder as Wrapped<unknown>), (key as Wrapped<unknown>));
  if (($.condition(Number.MAX_SAFE_INTEGER - 660, $.isType(value, "object"))) || ($.condition(Number.MAX_SAFE_INTEGER - 661, $.isType(value, "bigint"))))
  {
    var toJSON = AO__GetV($, (value as Wrapped<unknown>), ($.base<string>("toJSON", []) as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 662, $.is(AO__IsCallable($, (toJSON as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      value = AO__Call($, (toJSON as Wrapped<unknown>), (value as Wrapped<unknown>), ([key] as Wrapped<unknown>[]));
    }

  }

  if (!$.condition(Number.MAX_SAFE_INTEGER - 663, $.is(state["ReplacerFunction" /* TODO INTERNAL : internal access */], $.base<undefined>(undefined, []))))
  {
    value = AO__Call($, (state["ReplacerFunction" /* TODO INTERNAL : internal access */] as Wrapped<unknown>), (holder as Wrapped<unknown>), ([key, value] as Wrapped<unknown>[]));
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 664, $.isType(value, "object"))))
  {
    if (($.peek(value) instanceof Number))
    {
      value = AO__ToNumber($, (value as Wrapped<unknown>));
    }
    else
    {
      if (($.peek(value) instanceof String))
      {
        value = AO__ToString($, (value as Wrapped<unknown>));
      }
      else
      {
        if (($.peek(value) instanceof Boolean))
        {
          value = $.base($.peek(value).valueOf(), [value]);
        }
        else
        {
          if (($.peek(value) instanceof BigInt))
          {
            value = $.base($.peek(value).valueOf(), [value]);
          }

        }

      }

    }

  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 665, $.is(value, $.base<null>(null, []))))
  {
    return $.base<string>("null", []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 666, $.is(value, $.base<boolean>(true, []))))
  {
    return $.base<string>("true", []);
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 667, $.is(value, $.base<boolean>(false, []))))
  {
    return $.base<string>("false", []);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 668, $.isType(value, "string"))))
  {
    return AO__QuoteJSONString($, (value as Wrapped<string>));
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 669, $.isType(value, "number"))))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 670, $.isFinite(value)))
    {
      return AO__ToString($, (value as Wrapped<unknown>));
    }

    return $.base<string>("null", []);
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 671, $.isType(value, "bigint"))))
  {
    throw new TypeError;
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 672, $.isType(value, "object"))) && $.condition(Number.MAX_SAFE_INTEGER - 673, $.is(AO__IsCallable($, (value as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    var isArray = AO__IsArray($, (value as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 674, $.is(isArray, $.base<boolean>(true, []))))
    {
      return AO__SerializeJSONArray($, (state as Wrapped<unknown>), (value as Wrapped<unknown>));
    }

    return AO__SerializeJSONObject($, (state as Wrapped<unknown>), (value as Wrapped<unknown>));
  }

  return $.base<undefined>(undefined, []);
}
