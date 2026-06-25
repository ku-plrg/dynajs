// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Lifted<string>, searchValue : Lifted<string>, fromIndex : Lifted<number>) {
  var len = $.length(string);
  if ($.condition(Number.MAX_SAFE_INTEGER - 716, $.is(searchValue, $.lit<string>(""))) && $.condition(Number.MAX_SAFE_INTEGER - 717, $.lessThanEqual(fromIndex, len)))
  {
    return fromIndex;
  }

  var searchLen = $.length(searchValue);
  for (var i of $.range((fromIndex as Lifted<number>), true, ($.subtract((len as Lifted<number>), (searchLen as Lifted<number>)) as Lifted<number>), true, true, Number.MAX_SAFE_INTEGER - 719))
  {
    var candidate = $.substring(string, (i as Lifted<number>), ($.add((i as Lifted<number>), (searchLen as Lifted<number>)) as Lifted<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 718, $.is(candidate, searchValue)))
    {
      return i;
    }

  }

  return $.lit<string>("not-found");
}
