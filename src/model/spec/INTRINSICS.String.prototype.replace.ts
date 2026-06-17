
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__GetSubstitution } from "./AO__GetSubstitution.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_replace ($ : SpecRuntime, $this : Wrapped<unknown>, searchValue : Wrapped<unknown>, replaceValue : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.condition(Number.MAX_SAFE_INTEGER - 374, $.is(searchValue, $.base<undefined>(undefined, []))) || $.condition(Number.MAX_SAFE_INTEGER - 375, $.is(searchValue, $.base<null>(null, [])))))
  {
    var replacer = AO__GetMethod($, (searchValue as Wrapped<unknown>), ($.base<symbol>(Symbol.replace, []) as Wrapped<unknown>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 376, $.is(replacer, $.base<undefined>(undefined, []))))
    {
      return AO__Call($, (replacer as Wrapped<unknown>), (searchValue as Wrapped<unknown>), ([O, replaceValue] as Wrapped<unknown>[]));
    }

  }

  var string = AO__ToString($, (O as Wrapped<unknown>));
  var searchString = AO__ToString($, (searchValue as Wrapped<unknown>));
  var functionalReplace = AO__IsCallable($, (replaceValue as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 377, $.is(functionalReplace, $.base<boolean>(false, []))))
  {
    replaceValue = AO__ToString($, (replaceValue as Wrapped<unknown>));
  }

  var searchLength = $.length(searchString);
  var position = AO__StringIndexOf($, (string as Wrapped<string>), (searchString as Wrapped<string>), ($.base<number>(0, []) as Wrapped<number>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 378, $.is(position, $.base<string>("not-found", []))))
  {
    return string;
  }

  var preceding = $.substring(string, ($.base<number>(0, []) as Wrapped<number>), (position as Wrapped<number>));
  var following = $.substring(string, ($.add((position as Wrapped<number>), (searchLength as Wrapped<number>)) as Wrapped<number>), $.length(string));
  if ($.condition(Number.MAX_SAFE_INTEGER - 379, $.is(functionalReplace, $.base<boolean>(true, []))))
  {
    var replacement = AO__ToString($, (AO__Call($, (replaceValue as Wrapped<unknown>), ($.base<undefined>(undefined, []) as Wrapped<unknown>), ([searchString, position, string] as Wrapped<unknown>[])) as Wrapped<unknown>));
  }
  else
  {
    var captures = [] as Wrapped<never>[];
    var replacement = AO__GetSubstitution($, (searchString as Wrapped<string>), (string as Wrapped<string>), (position as Wrapped<number>), (captures as Wrapped<string | undefined>[]), ($.base<undefined>(undefined, []) as Wrapped<unknown>), (replaceValue as Wrapped<string>));
  }

  return $.concatenate($.concatenate(preceding, replacement), following);
}
