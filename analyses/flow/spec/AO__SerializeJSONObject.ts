// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__EnumerableOwnProperties } from "./AO__EnumerableOwnProperties.js";
import { AO__QuoteJSONString } from "./AO__QuoteJSONString.js";
import { AO__SerializeJSONProperty } from "./AO__SerializeJSONProperty.js";

export function AO__SerializeJSONObject ($ : SpecRuntime, state : Lifted<unknown>, value : Lifted<unknown>) {
  if ($.contains(state["Stack" /* TODO INTERNAL : internal access */], value))
  {
    throw new TypeError("JSON.stringify: cannot serialize cyclic structure");
  }

  $.append(state["Stack" /* TODO INTERNAL : internal access */], value)
  var stepBack = state["Indent" /* TODO INTERNAL : internal access */];
  state["Indent" /* TODO INTERNAL : internal access */] = $.concatenate(state["Indent" /* TODO INTERNAL : internal access */], state["Gap" /* TODO INTERNAL : internal access */]);
  if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 679, $.is(state["PropertyList" /* TODO INTERNAL : internal access */], $.default<undefined>(undefined, [])))))
  {
    var K = state["PropertyList" /* TODO INTERNAL : internal access */];
  }
  else
  {
    var K = AO__EnumerableOwnProperties($, (value as Lifted<unknown>), ($.default<string>("key", []) as Lifted<unknown>));
  }

  var partial = [] as Lifted<never>[];
  for (var P of K)
  {
    var strP = AO__SerializeJSONProperty($, (state as Lifted<unknown>), (P as Lifted<string>), (value as Lifted<unknown>));
    if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 680, $.is(strP, $.default<undefined>(undefined, [])))))
    {
      var member = AO__QuoteJSONString($, (P as Lifted<string>));
      member = $.concatenate(member, $.default<string>(":", []));
      if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 681, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.default<string>("", [])))))
      {
        member = $.concatenate(member, $.default<string>(" ", []));
      }

      member = $.concatenate(member, strP);
      $.append(partial, member)
    }

  }

  if ((partial.length === 0))
  {
    var final = $.default<string>("{}", []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 682, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.default<string>("", [])))))
    {
      var properties = (partial as Lifted<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.default<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.default<string>("{", []), properties), $.default<string>("}", []));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.default<string>(",", []), $.default<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Lifted<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.default<string>("{", []), $.default<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.default<string>("\n", [])), stepBack), $.default<string>("}", []));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
