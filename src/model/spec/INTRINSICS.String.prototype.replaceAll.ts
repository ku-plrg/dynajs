
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__GetSubstitution } from "./AO__GetSubstitution.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__IsRegExp } from "./AO__IsRegExp.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_replaceAll ($ : BootStrap, $this : Wrapped<unknown>, searchValue : Wrapped<unknown>, replaceValue : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.is(searchValue, $.base<undefined>(undefined, [])) || $.is(searchValue, $.base<null>(null, []))))
  {
    var isRegExp = AO__IsRegExp($, (searchValue as Wrapped<unknown>));
    if ($.is(isRegExp, $.base<boolean>(true, [])))
    {
      var flags = AO__Get($, (searchValue as Wrapped<unknown>), ($.base<string>("flags", []) as Wrapped<unknown>));
      AO__RequireObjectCoercible($, flags);
      if (!$.contains(AO__ToString($, (flags as Wrapped<unknown>)), $.base<string>("g", [])))
      {
        throw new TypeError;
      }

    }

    var replacer = AO__GetMethod($, (searchValue as Wrapped<unknown>), ($.base<symbol>(Symbol.replace, []) as Wrapped<unknown>));
    if (!$.is(replacer, $.base<undefined>(undefined, [])))
    {
      return AO__Call($, (replacer as Wrapped<unknown>), (searchValue as Wrapped<unknown>), ([O, replaceValue] as Wrapped<unknown>[]));
    }

  }

  var string = AO__ToString($, (O as Wrapped<unknown>));
  var searchString = AO__ToString($, (searchValue as Wrapped<unknown>));
  var functionalReplace = AO__IsCallable($, (replaceValue as Wrapped<unknown>));
  if ($.is(functionalReplace, $.base<boolean>(false, [])))
  {
    replaceValue = AO__ToString($, (replaceValue as Wrapped<unknown>));
  }

  var searchLength = $.length(searchString);
  var advanceBy = $.max($.base<number>(1, []), searchLength);
  var matchPositions = [] as Wrapped<never>[];
  var position = AO__StringIndexOf($, (string as Wrapped<string>), (searchString as Wrapped<string>), ($.base<number>(0, []) as Wrapped<number>));
  while (!$.is(position, $.base<string>("not-found", [])))
  {
    $.append(matchPositions, position)
    position = AO__StringIndexOf($, (string as Wrapped<string>), (searchString as Wrapped<string>), ($.add(position, advanceBy) as Wrapped<number>));
  }

  var endOfLastMatch = $.base<number>(0, []);
  var result = $.base<string>("", []);
  for (var _x0 = 0; _x0 < matchPositions.length; _x0++)
  {
    var p = matchPositions[_x0];
    var preserved = $.substring(string, endOfLastMatch, p);
    if ($.is(functionalReplace, $.base<boolean>(true, [])))
    {
      var replacement = AO__ToString($, (AO__Call($, (replaceValue as Wrapped<unknown>), ($.base<undefined>(undefined, []) as Wrapped<unknown>), ([searchString, p, string] as Wrapped<unknown>[])) as Wrapped<unknown>));
    }
    else
    {
      var captures = [] as Wrapped<never>[];
      var replacement = AO__GetSubstitution($, (searchString as Wrapped<string>), (string as Wrapped<string>), (p as Wrapped<number>), (captures as Wrapped<string | undefined>[]), ($.base<undefined>(undefined, []) as Wrapped<unknown>), (replaceValue as Wrapped<string>));
    }

    result = $.concatenate($.concatenate(result, preserved), replacement);
    endOfLastMatch = $.add(p, searchLength);
  }

  if ($.condition(0, $.lessThan(endOfLastMatch, $.length(string))))
  {
    result = $.concatenate(result, $.substring(string, endOfLastMatch, $.length(string)));
  }

  return result;
}
