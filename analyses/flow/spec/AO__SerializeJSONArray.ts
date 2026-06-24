// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SerializeJSONProperty } from "./AO__SerializeJSONProperty.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__SerializeJSONArray ($ : SpecRuntime, state : Wrapped<unknown>, value : Wrapped<unknown>) {
  if ($.contains(state["Stack" /* TODO INTERNAL : internal access */], value))
  {
    throw new TypeError("JSON.stringify: cannot serialize cyclic structure");
  }

  $.append(state["Stack" /* TODO INTERNAL : internal access */], value)
  var stepBack = state["Indent" /* TODO INTERNAL : internal access */];
  state["Indent" /* TODO INTERNAL : internal access */] = $.concatenate(state["Indent" /* TODO INTERNAL : internal access */], state["Gap" /* TODO INTERNAL : internal access */]);
  var partial = [] as Wrapped<never>[];
  var len = AO__LengthOfArrayLike($, (value as Wrapped<unknown>));
  var index = $.lit<number>(0);
  while ($.condition(Number.MAX_SAFE_INTEGER - 657, $.lessThan(index, len)))
  {
    var strP = AO__SerializeJSONProperty($, (state as Wrapped<unknown>), (AO__ToString($, (index as Wrapped<unknown>)) as Wrapped<string>), (value as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 658, $.is(strP, $.lit<undefined>(undefined))))
    {
      $.append(partial, $.lit<string>("null"))
    }
    else
    {
      $.append(partial, strP)
    }

    index = $.add((index as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
  }

  if ((partial.length === 0))
  {
    var final = $.lit<string>("[]");
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 659, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.lit<string>(""))))
    {
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.base<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.lit<string>("["), properties), $.lit<string>("]"));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.lit<string>(","), $.lit<string>("\n")), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.lit<string>("["), $.lit<string>("\n")), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.lit<string>("\n")), stepBack), $.lit<string>("]"));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
