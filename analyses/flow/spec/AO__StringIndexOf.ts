// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Wrapped<string>, searchValue : Wrapped<string>, fromIndex : Wrapped<number>) {
  var len = $.length(string);
  if ($.condition(Number.MAX_SAFE_INTEGER - 697, $.is(searchValue, $.lit<string>(""))) && $.condition(Number.MAX_SAFE_INTEGER - 698, $.lessThanEqual(fromIndex, len)))
  {
    return fromIndex;
  }

  var searchLen = $.length(searchValue);
  for (var i of $.range((fromIndex as Wrapped<number>), true, ($.subtract((len as Wrapped<number>), (searchLen as Wrapped<number>)) as Wrapped<number>), true, true, Number.MAX_SAFE_INTEGER - 700))
  {
    var candidate = $.substring(string, (i as Wrapped<number>), ($.add((i as Wrapped<number>), (searchLen as Wrapped<number>)) as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 699, $.is(candidate, searchValue)))
    {
      return i;
    }

  }

  return $.lit<string>("not-found");
}
