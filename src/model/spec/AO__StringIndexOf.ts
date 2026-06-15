
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Wrapped<string>, searchValue : Wrapped<string>, fromIndex : Wrapped<number>) {
  var len = $.length(string);
  if ($.is(searchValue, $.base<string>("", [])) && $.condition(Number.MAX_SAFE_INTEGER - 119, $.lessThanEqual(fromIndex, len)))
  {
    return fromIndex;
  }

  var searchLen = $.length(searchValue);
  for (var i = fromIndex; i <=$.subtract(len, searchLen); i++)
  {
    var candidate = $.substring(string, i, $.add(i, searchLen));
    if ($.is(candidate, searchValue))
    {
      return i;
    }

  }

  return $.base<string>("not-found", []);
}
