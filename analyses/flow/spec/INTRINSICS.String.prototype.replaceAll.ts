// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__GetSubstitution } from "./AO__GetSubstitution.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_replaceAll ($ : SpecRuntime, $this : Lifted<unknown>, searchValue : Lifted<unknown>, replaceValue : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 470, $.is(searchValue, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 471, $.is(searchValue, $.default<null>(null, []))))))
  {
    var isRegExp = AO__IsRegExp($, (searchValue as Lifted<unknown>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 472, $.is(isRegExp, $.default<boolean>(true, [])))))
    {
      var flags = AO__Get($, (searchValue as Lifted<unknown>), ($.default<string>("flags", []) as Lifted<unknown>));
      AO__RequireObjectCoercible($, flags);
      if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 473, $.contains(AO__ToString($, (flags as Lifted<unknown>)), $.default<string>("g", [])))))
      {
        throw new TypeError;
      }

    }

    var replacer = AO__GetMethod($, (searchValue as Lifted<unknown>), ($.default<symbol>(Symbol.replace, []) as Lifted<unknown>));
    if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 474, $.is(replacer, $.default<undefined>(undefined, [])))))
    {
      return AO__Call($, (replacer as Lifted<unknown>), (searchValue as Lifted<unknown>), ([O, replaceValue] as Lifted<unknown>[]));
    }

  }

  var string = AO__ToString($, (O as Lifted<unknown>));
  var searchString = AO__ToString($, (searchValue as Lifted<unknown>));
  var functionalReplace = AO__IsCallable($, (replaceValue as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 475, $.is(functionalReplace, $.default<boolean>(false, [])))))
  {
    replaceValue = AO__ToString($, (replaceValue as Lifted<unknown>));
  }

  var searchLength = $.length(searchString);
  var advanceBy = $.max($.default<number>(1, []), searchLength);
  var matchPositions = [] as Lifted<never>[];
  var position = AO__StringIndexOf($, (string as Lifted<string>), (searchString as Lifted<string>), ($.default<number>(0, []) as Lifted<number>));
  while (!$.value($.condition(Number.MAX_SAFE_INTEGER - 476, $.is(position, $.default<number>(-1, [])))))
  {
    $.append(matchPositions, position)
    position = AO__StringIndexOf($, (string as Lifted<string>), (searchString as Lifted<string>), ($.add((position as Lifted<number>), (advanceBy as Lifted<number>)) as Lifted<number>));
  }

  var endOfLastMatch = $.default<number>(0, []);
  var result = $.default<string>("", []);
  for (var p of matchPositions)
  {
    var preserved = $.substring(string, (endOfLastMatch as Lifted<number>), (p as Lifted<number>));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 477, $.is(functionalReplace, $.default<boolean>(true, [])))))
    {
      var replacement = AO__ToString($, (AO__Call($, (replaceValue as Lifted<unknown>), ($.default<undefined>(undefined, []) as Lifted<unknown>), ([searchString, p, string] as Lifted<unknown>[])) as Lifted<unknown>));
    }
    else
    {
      var captures = [] as Lifted<never>[];
      var replacement = AO__GetSubstitution($, (searchString as Lifted<string>), (string as Lifted<string>), (p as Lifted<number>), (captures as Lifted<string | undefined>[]), ($.default<undefined>(undefined, []) as Lifted<unknown>), (replaceValue as Lifted<string>));
    }

    result = $.concatenate($.concatenate(result, preserved), replacement);
    endOfLastMatch = $.add((p as Lifted<number>), (searchLength as Lifted<number>));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 478, $.lessThan(endOfLastMatch, $.length(string)))))
  {
    result = $.concatenate(result, $.substring(string, (endOfLastMatch as Lifted<number>), $.length(string)));
  }

  return result;
}
