// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__LengthOfArrayLike } from "./AO__LengthOfArrayLike.js";
import { AO__SerializeJSONProperty } from "./AO__SerializeJSONProperty.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__SerializeJSONArray ($ : SpecRuntime, state : Lifted<unknown>, value : Lifted<unknown>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 680, $.contains(state["Stack" /* TODO INTERNAL : internal access */], value))))
  {
    throw new TypeError("JSON.stringify: cannot serialize cyclic structure");
  }

  $.append(state["Stack" /* TODO INTERNAL : internal access */], value)
  var stepBack = state["Indent" /* TODO INTERNAL : internal access */];
  state["Indent" /* TODO INTERNAL : internal access */] = $.concatenate(state["Indent" /* TODO INTERNAL : internal access */], state["Gap" /* TODO INTERNAL : internal access */]);
  var partial = [] as Lifted<never>[];
  var len = AO__LengthOfArrayLike($, (value as Lifted<unknown>));
  var index = $.default<number>(0, []);
  while ($.value($.condition(Number.MAX_SAFE_INTEGER - 681, $.lessThan(index, len))))
  {
    var strP = AO__SerializeJSONProperty($, (state as Lifted<unknown>), (AO__ToString($, (index as Lifted<unknown>)) as Lifted<string>), (value as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 682, $.is(strP, $.default<undefined>(undefined, [])))))
    {
      $.append(partial, $.default<string>("null", []))
    }
    else
    {
      $.append(partial, strP)
    }

    index = $.add((index as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  if ((partial.length === 0))
  {
    var final = $.default<string>("[]", []);
  }
  else
  {
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 683, $.is(state["Gap" /* TODO INTERNAL : internal access */], $.default<string>("", [])))))
    {
      var properties = (partial as Lifted<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate($.default<string>(",", []), b)));
      var final = $.concatenate($.concatenate($.default<string>("[", []), properties), $.default<string>("]", []));
    }
    else
    {
      var separator = $.concatenate($.concatenate($.default<string>(",", []), $.default<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]);
      var properties = (partial as Lifted<string>[]).reduce((a, b) => $.concatenate(a, $.concatenate(separator, b)));
      var final = $.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.concatenate($.default<string>("[", []), $.default<string>("\n", [])), state["Indent" /* TODO INTERNAL : internal access */]), properties), $.default<string>("\n", [])), stepBack), $.default<string>("]", []));
    }

  }

  state["Stack" /* TODO INTERNAL : internal access */].pop()
  state["Indent" /* TODO INTERNAL : internal access */] = stepBack;
  return final;
}
