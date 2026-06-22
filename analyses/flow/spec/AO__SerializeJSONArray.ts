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
  var index = $.base<number>(0, []);
  while ($.condition(Number.MAX_SAFE_INTEGER - 560, $.lessThan(index, len)))
  {
    var strP = AO__SerializeJSONProperty($, (state as Wrapped<unknown>), (AO__ToString($, (index as Wrapped<unknown>)) as Wrapped<string>), (value as Wrapped<unknown>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 561, $.is(strP, $.base<undefined>(undefined, []))))
    {
      $.append(partial, $.base<string>("null", []))
    }
    else
    {
      $.append(partial, strP)
    }

    index = $.add((index as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  if ((partial.length === 0))
  {
    var final = $.base<string>("[]", []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 562, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.base<string>("", []))))
    {
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.base<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.base<string>("[", []), properties), $.base<string>("]", []));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.base<string>(",", []), $.base<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.base<string>("[", []), $.base<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.base<string>("\n", [])), stepBack), $.base<string>("]", []));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
