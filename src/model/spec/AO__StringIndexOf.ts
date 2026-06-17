
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Wrapped<string>, searchValue : Wrapped<string>, fromIndex : Wrapped<number>) {
  var len = $.length(string);
  if ($.condition(Number.MAX_SAFE_INTEGER - 561, $.is(searchValue, $.base<string>("", []))) && $.condition(Number.MAX_SAFE_INTEGER - 562, $.lessThanEqual(fromIndex, len)))
  {
    return fromIndex;
  }

  var searchLen = $.length(searchValue);
  for (var i = fromIndex; $.condition(Number.MAX_SAFE_INTEGER - 564, $.lessThanEqual(i, $.subtract((len as Wrapped<number>), (searchLen as Wrapped<number>)))); i++)
  {
    var candidate = $.substring(string, (i as Wrapped<number>), ($.add((i as Wrapped<number>), (searchLen as Wrapped<number>)) as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 563, $.is(candidate, searchValue)))
    {
      return i;
    }

  }

  return $.base<string>("not-found", []);
}
