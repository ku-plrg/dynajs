// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateArrayFromList } from "./AO__CreateArrayFromList.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__ToUint32 } from "./AO__ToUint32.js";

export function INTRINSICS_String_prototype_split ($ : SpecRuntime, $this : Lifted<unknown>, separator : Lifted<unknown>, limit : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 488, $.is(separator, $.default<undefined>(undefined, [])))) || $.value($.condition(Number.MAX_SAFE_INTEGER - 489, $.is(separator, $.default<null>(null, []))))))
  {
    var splitter = AO__GetMethod($, (separator as Lifted<unknown>), ($.default<symbol>(Symbol.split, []) as Lifted<unknown>));
    if (!$.value($.condition(Number.MAX_SAFE_INTEGER - 490, $.is(splitter, $.default<undefined>(undefined, [])))))
    {
      return AO__Call($, (splitter as Lifted<unknown>), (separator as Lifted<unknown>), ([O, limit] as Lifted<unknown>[]));
    }

  }

  var S = AO__ToString($, (O as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 491, $.is(limit, $.default<undefined>(undefined, [])))))
  {
    var lim = $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(32, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }
  else
  {
    var lim = AO__ToUint32($, (limit as Lifted<unknown>));
  }

  var R = AO__ToString($, (separator as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 492, $.is(lim, $.default<number>(0, [])))))
  {
    return AO__CreateArrayFromList($, ([] as Lifted<unknown>[]));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 493, $.is(separator, $.default<undefined>(undefined, [])))))
  {
    return AO__CreateArrayFromList($, ([S] as Lifted<unknown>[]));
  }

  var separatorLength = $.length(R);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 494, $.is(separatorLength, $.default<number>(0, [])))))
  {
    var strLen = $.length(S);
    var outLen = $.clamp(lim, $.default<number>(0, []), strLen);
    var head = $.substring(S, ($.default<number>(0, []) as Lifted<number>), (outLen as Lifted<number>));
    var codeUnits = $.value(head).split("").map((c) => $.default<string>(c, [head]));
    return AO__CreateArrayFromList($, (codeUnits as Lifted<unknown>[]));
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 495, $.is(S, $.default<string>("", [])))))
  {
    return AO__CreateArrayFromList($, ([S] as Lifted<unknown>[]));
  }

  var substrings = [] as Lifted<never>[];
  var i = $.default<number>(0, []);
  var j = AO__StringIndexOf($, (S as Lifted<string>), (R as Lifted<string>), ($.default<number>(0, []) as Lifted<number>));
  while (!$.value($.condition(Number.MAX_SAFE_INTEGER - 496, $.is(j, $.default<number>(-1, [])))))
  {
    var T = $.substring(S, (i as Lifted<number>), (j as Lifted<number>));
    $.append(substrings, T)
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 497, $.is($.default<number>(substrings.length, []), lim))))
    {
      return AO__CreateArrayFromList($, (substrings as Lifted<unknown>[]));
    }

    i = $.add((j as Lifted<number>), (separatorLength as Lifted<number>));
    j = AO__StringIndexOf($, (S as Lifted<string>), (R as Lifted<string>), (i as Lifted<number>));
  }

  var T = $.substring(S, (i as Lifted<number>), $.length(S));
  $.append(substrings, T)
  return AO__CreateArrayFromList($, (substrings as Lifted<unknown>[]));
}
