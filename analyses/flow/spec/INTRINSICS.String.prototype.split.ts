// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateArrayFromList } from "./AO__CreateArrayFromList.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__ToUint32 } from "./AO__ToUint32.js";

export function INTRINSICS_String_prototype_split ($ : SpecRuntime, $this : Wrapped<unknown>, separator : Wrapped<unknown>, limit : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.condition(Number.MAX_SAFE_INTEGER - 454, $.is(separator, $.lit<undefined>(undefined))) || $.condition(Number.MAX_SAFE_INTEGER - 455, $.is(separator, $.lit<null>(null)))))
  {
    var splitter = AO__GetMethod($, (separator as Wrapped<unknown>), ($.lit<symbol>(Symbol.split) as Wrapped<unknown>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 456, $.is(splitter, $.lit<undefined>(undefined))))
    {
      return AO__Call($, (splitter as Wrapped<unknown>), (separator as Wrapped<unknown>), ([O, limit] as Wrapped<unknown>[]));
    }

  }

  var S = AO__ToString($, (O as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 457, $.is(limit, $.lit<undefined>(undefined))))
  {
    var lim = $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(32)) as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
  }
  else
  {
    var lim = AO__ToUint32($, (limit as Wrapped<unknown>));
  }

  var R = AO__ToString($, (separator as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 458, $.is(lim, $.lit<number>(0))))
  {
    return AO__CreateArrayFromList($, ([] as Wrapped<unknown>[]));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 459, $.is(separator, $.lit<undefined>(undefined))))
  {
    return AO__CreateArrayFromList($, ([S] as Wrapped<unknown>[]));
  }

  var separatorLength = $.length(R);
  if ($.condition(Number.MAX_SAFE_INTEGER - 460, $.is(separatorLength, $.lit<number>(0))))
  {
    var strLen = $.length(S);
    var outLen = $.clamp(lim, $.lit<number>(0), strLen);
    var head = $.substring(S, ($.lit<number>(0) as Wrapped<number>), (outLen as Wrapped<number>));
    var codeUnits = $.peek(head).split("").map((c) => $.base<string>(c, [head]));
    return AO__CreateArrayFromList($, (codeUnits as Wrapped<unknown>[]));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 461, $.is(S, $.lit<string>(""))))
  {
    return AO__CreateArrayFromList($, ([S] as Wrapped<unknown>[]));
  }

  var substrings = [] as Wrapped<never>[];
  var i = $.lit<number>(0);
  var j = AO__StringIndexOf($, (S as Wrapped<string>), (R as Wrapped<string>), ($.lit<number>(0) as Wrapped<number>));
  while (!$.condition(Number.MAX_SAFE_INTEGER - 462, $.is(j, $.lit<string>("not-found"))))
  {
    var T = $.substring(S, (i as Wrapped<number>), (j as Wrapped<number>));
    $.append(substrings, T)
    if ($.condition(Number.MAX_SAFE_INTEGER - 463, $.is($.base<number>(substrings.length, []), lim)))
    {
      return AO__CreateArrayFromList($, (substrings as Wrapped<unknown>[]));
    }

    i = $.add((j as Wrapped<number>), (separatorLength as Wrapped<number>));
    j = AO__StringIndexOf($, (S as Wrapped<string>), (R as Wrapped<string>), (i as Wrapped<number>));
  }

  var T = $.substring(S, (i as Wrapped<number>), $.length(S));
  $.append(substrings, T)
  return AO__CreateArrayFromList($, (substrings as Wrapped<unknown>[]));
}
