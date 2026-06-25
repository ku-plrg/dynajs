// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

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

export function AO__SerializeJSONProperty ($ : SpecRuntime, state : Lifted<unknown>, key : Lifted<string>, holder : Lifted<unknown>) {
  var value = AO__Get($, (holder as Lifted<unknown>), (key as Lifted<unknown>));
  if (($.condition(Number.MAX_SAFE_INTEGER - 683, $.isType(value, "object"))) || ($.condition(Number.MAX_SAFE_INTEGER - 684, $.isType(value, "bigint"))))
  {
    var toJSON = AO__GetV($, (value as Lifted<unknown>), ($.lit<string>("toJSON") as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 685, $.is(AO__IsCallable($, (toJSON as Lifted<unknown>)), $.lit<boolean>(true))))
    {
      value = AO__Call($, (toJSON as Lifted<unknown>), (value as Lifted<unknown>), ([key] as Lifted<unknown>[]));
    }

  }

  if (!$.condition(Number.MAX_SAFE_INTEGER - 686, $.is(state["ReplacerFunction" /* TODO INTERNAL : internal access */], $.lit<undefined>(undefined))))
  {
    value = AO__Call($, (state["ReplacerFunction" /* TODO INTERNAL : internal access */] as Lifted<unknown>), (holder as Lifted<unknown>), ([key, value] as Lifted<unknown>[]));
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 687, $.isType(value, "object"))))
  {
    if (($.peek(value) instanceof Number))
    {
      value = AO__ToNumber($, (value as Lifted<unknown>));
    }
    else
    {
      if (($.peek(value) instanceof String))
      {
        value = AO__ToString($, (value as Lifted<unknown>));
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

  if ($.condition(Number.MAX_SAFE_INTEGER - 688, $.is(value, $.lit<null>(null))))
  {
    return $.lit<string>("null");
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 689, $.is(value, $.lit<boolean>(true))))
  {
    return $.lit<string>("true");
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 690, $.is(value, $.lit<boolean>(false))))
  {
    return $.lit<string>("false");
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 691, $.isType(value, "string"))))
  {
    return AO__QuoteJSONString($, (value as Lifted<string>));
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 692, $.isType(value, "number"))))
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 693, $.isFinite(value)))
    {
      return AO__ToString($, (value as Lifted<unknown>));
    }

    return $.lit<string>("null");
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 694, $.isType(value, "bigint"))))
  {
    throw new TypeError;
  }

  if (($.condition(Number.MAX_SAFE_INTEGER - 695, $.isType(value, "object"))) && $.condition(Number.MAX_SAFE_INTEGER - 696, $.is(AO__IsCallable($, (value as Lifted<unknown>)), $.lit<boolean>(false))))
  {
    var isArray = AO__IsArray($, (value as Lifted<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 697, $.is(isArray, $.lit<boolean>(true))))
    {
      return AO__SerializeJSONArray($, (state as Lifted<unknown>), (value as Lifted<unknown>));
    }

    return AO__SerializeJSONObject($, (state as Lifted<unknown>), (value as Lifted<unknown>));
  }

  return $.lit<undefined>(undefined);
}
