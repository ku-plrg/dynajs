
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__StringLastIndexOf ($ : BootStrap, string : Wrapped<string>, searchValue : Wrapped<string>, fromIndex : Wrapped<number>) {
  var len = $.length(string);
  var searchLen = $.length(searchValue);
  for (var i = $.base<number>(0, []); i >=fromIndex; i--)
  {
    var candidate = $.substring(string, i, $.add(i, searchLen));
    if ($.is(candidate, searchValue))
    {
      return i;
    }

  }

  return $.base<string>("not-found", []);
}
