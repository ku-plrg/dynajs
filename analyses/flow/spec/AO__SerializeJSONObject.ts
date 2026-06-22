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
  if (!$.condition(Number.MAX_SAFE_INTEGER - 584, $.is(state["PropertyList" /* TODO INTERNAL : internal access */], $.base<undefined>(undefined, []))))
  {
    var K = state["PropertyList" /* TODO INTERNAL : internal access */];
  }
  else
  {
    var K = AO__EnumerableOwnProperties($, (value as Wrapped<unknown>), ($.base<string>("key", []) as Wrapped<unknown>));
  }

  var partial = [] as Wrapped<never>[];
  for (var P of K)
  {
    var strP = AO__SerializeJSONProperty($, (state as Wrapped<unknown>), (P as Wrapped<string>), (value as Wrapped<unknown>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 585, $.is(strP, $.base<undefined>(undefined, []))))
    {
      var member = AO__QuoteJSONString($, (P as Wrapped<string>));
      member = $.concatenate(member, $.base<string>(":", []));
      if (!$.condition(Number.MAX_SAFE_INTEGER - 586, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.base<string>("", []))))
      {
        member = $.concatenate(member, $.base<string>(" ", []));
      }

      member = $.concatenate(member, strP);
      $.append(partial, member)
    }

  }

  if ((partial.length === 0))
  {
    var final = $.base<string>("{}", []);
  }
  else
  {
    if ($.condition(Number.MAX_SAFE_INTEGER - 587, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.base<string>("", []))))
    {
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.base<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.base<string>("{", []), properties), $.base<string>("}", []));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.base<string>(",", []), $.base<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Wrapped<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.base<string>("{", []), $.base<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.base<string>("\n", [])), stepBack), $.base<string>("}", []));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
