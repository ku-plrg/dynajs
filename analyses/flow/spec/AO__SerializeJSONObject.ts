// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__EnumerableOwnProperties } from "./AO__EnumerableOwnProperties.js";
import { AO__QuoteJSONString } from "./AO__QuoteJSONString.js";
import { AO__SerializeJSONProperty } from "./AO__SerializeJSONProperty.js";

export function AO__SerializeJSONObject ($ : SpecRuntime, state : Wrapped<unknown>, value : Wrapped<unknown>) {
  if ($.contains(state["Stack" /* TODO INTERNAL : internal access */], value))
  {
    throw new TypeError("JSON.stringify: cannot serialize cyclic structure");
  }

  $.append(state["Stack" /* TODO INTERNAL : internal access */], value)
  var stepBack = state["Indent" /* TODO INTERNAL : internal access */];
  state["Indent" /* TODO INTERNAL : internal access */] = $.concatenate(state["Indent" /* TODO INTERNAL : internal access */], state["Gap" /* TODO INTERNAL : internal access */]);
  if (!$.condition(Number.MAX_SAFE_INTEGER - 660, $.is(state["PropertyList" /* TODO INTERNAL : internal access */], $.lit<undefined>(undefined))))
  {
    var K = state["PropertyList" /* TODO INTERNAL : internal access */];
  }
  else
  {
    var K = AO__EnumerableOwnProperties($, (value as Wrapped<unknown>), ($.lit<string>("key") as Wrapped<unknown>));
  }

  var partial = [] as Wrapped<never>[];
  for (var P of K)
  {
    var strP = AO__SerializeJSONProperty($, (state as Wrapped<unknown>), (P as Wrapped<string>), (value as Wrapped<unknown>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 661, $.is(strP, $.lit<undefined>(undefined))))
    {
      var member = AO__QuoteJSONString($, (P as Wrapped<string>));
      member = $.concatenate(member, $.lit<string>(":"));
      if (!$.condition(Number.MAX_SAFE_INTEGER - 662, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.lit<string>(""))))
      {
        member = $.concatenate(member, $.lit<string>(" "));
      }

      member = $.concatenate(member, strP);
      $.append(partial, member)
    }

  }

  if ((partial.length === 0))
  {
    var final = $.lit<string>("{}");
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 663, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.lit<string>(""))))
    {
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.base<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.lit<string>("{"), properties), $.lit<string>("}"));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.lit<string>(","), $.lit<string>("\n")), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.lit<string>("{"), $.lit<string>("\n")), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.lit<string>("\n")), stepBack), $.lit<string>("}"));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
