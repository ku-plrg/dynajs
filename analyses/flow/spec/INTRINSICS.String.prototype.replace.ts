// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__GetSubstitution } from "./AO__GetSubstitution.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";

export function INTRINSICS_String_prototype_replace ($ : SpecRuntime, $this : Lifted<unknown>, searchValue : Lifted<unknown>, replaceValue : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 464, $.is(searchValue, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 465, $.is(searchValue, $.default<null>(null, []))))))
  {
    var replacer = AO__GetMethod($, (searchValue as Lifted<unknown>), ($.default<symbol>(Symbol.replace, []) as Lifted<unknown>));
    if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 466, $.is(replacer, $.default<undefined>(undefined, [])))))
    {
      return AO__Call($, (replacer as Lifted<unknown>), (searchValue as Lifted<unknown>), ([O, replaceValue] as Lifted<unknown>[]));
    }

  }

  var string = AO__ToString($, (O as Lifted<unknown>));
  var searchString = AO__ToString($, (searchValue as Lifted<unknown>));
  var functionalReplace = AO__IsCallable($, (replaceValue as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 467, $.is(functionalReplace, $.default<boolean>(false, [])))))
  {
    replaceValue = AO__ToString($, (replaceValue as Lifted<unknown>));
  }

  var searchLength = $.length(searchString);
  var position = AO__StringIndexOf($, (string as Lifted<string>), (searchString as Lifted<string>), ($.default<number>(0, []) as Lifted<number>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 468, $.is(position, $.default<number>(-1, [])))))
  {
    return string;
  }

  var preceding = $.substring(string, ($.default<number>(0, []) as Lifted<number>), (position as Lifted<number>));
  var following = $.substring(string, ($.add((position as Lifted<number>), (searchLength as Lifted<number>)) as Lifted<number>), $.length(string));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 469, $.is(functionalReplace, $.default<boolean>(true, [])))))
  {
    var replacement = AO__ToString($, (AO__Call($, (replaceValue as Lifted<unknown>), ($.default<undefined>(undefined, []) as Lifted<unknown>), ([searchString, position, string] as Lifted<unknown>[])) as Lifted<unknown>));
  }
  else
  {
    var captures = [] as Lifted<never>[];
    var replacement = AO__GetSubstitution($, (searchString as Lifted<string>), (string as Lifted<string>), (position as Lifted<number>), (captures as Lifted<string | undefined>[]), ($.default<undefined>(undefined, []) as Lifted<unknown>), (replaceValue as Lifted<string>));
  }

  return $.concatenate($.concatenate(preceding, replacement), following);
}
