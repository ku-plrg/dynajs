// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__StringLastIndexOf ($ : SpecRuntime, string : Lifted<string>, searchValue : Lifted<string>, fromIndex : Lifted<number>) {
  var len = $.length(string);
  var searchLen = $.length(searchValue);
  for (var i of $.range(($.lit<number>(0) as Lifted<number>), true, (fromIndex as Lifted<number>), true, false, Number.MAX_SAFE_INTEGER - 721))
  {
    var candidate = $.substring(string, (i as Lifted<number>), ($.add((i as Lifted<number>), (searchLen as Lifted<number>)) as Lifted<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 720, $.is(candidate, searchValue)))
    {
      return i;
    }

  }

  return $.lit<string>("not-found");
}
