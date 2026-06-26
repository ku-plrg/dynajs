// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Lifted<string>, searchValue : Lifted<string>, fromIndex : Lifted<number>) {
  var len = $.length(string);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 770, $.is(searchValue, $.default<string>("", [])))) && $.value($.condition(Number.MAX_SAFE_INTEGER - 771, $.lessThanEqual(fromIndex, len))))
  {
    return fromIndex;
  }

  var searchLen = $.length(searchValue);
  for (var i of $.range((fromIndex as Lifted<number>), true, ($.subtract((len as Lifted<number>), (searchLen as Lifted<number>)) as Lifted<number>), true, true, Number.MAX_SAFE_INTEGER - 773))
  {
    var candidate = $.substring(string, (i as Lifted<number>), ($.add((i as Lifted<number>), (searchLen as Lifted<number>)) as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 772, $.is(candidate, searchValue))))
    {
      return i;
    }

  }

  return $.default<string>("not-found", []);
}
