// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__StringLastIndexOf ($ : SpecRuntime, string : Wrapped<string>, searchValue : Wrapped<string>, fromIndex : Wrapped<number>) {
  var len = $.length(string);
  var searchLen = $.length(searchValue);
  for (var i = $.base<number>(0, []); $.condition(Number.MAX_SAFE_INTEGER - 590, $.greaterThanEqual(i, fromIndex)); i--)
  {
    var candidate = $.substring(string, (i as Wrapped<number>), ($.add((i as Wrapped<number>), (searchLen as Wrapped<number>)) as Wrapped<number>));
    if ($.condition(Number.MAX_SAFE_INTEGER - 589, $.is(candidate, searchValue)))
    {
      return i;
    }

  }

  return $.base<string>("not-found", []);
}
