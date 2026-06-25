// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateArrayFromList } from "./AO__CreateArrayFromList.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__ToUint32 } from "./AO__ToUint32.js";

export function INTRINSICS_String_prototype_split ($ : SpecRuntime, $this : Lifted<unknown>, separator : Lifted<unknown>, limit : Lifted<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.condition(Number.MAX_SAFE_INTEGER - 473, $.is(separator, $.lit<undefined>(undefined))) || $.condition(Number.MAX_SAFE_INTEGER - 474, $.is(separator, $.lit<null>(null)))))
  {
    var splitter = AO__GetMethod($, (separator as Lifted<unknown>), ($.lit<symbol>(Symbol.split) as Lifted<unknown>));
    if (!$.condition(Number.MAX_SAFE_INTEGER - 475, $.is(splitter, $.lit<undefined>(undefined))))
    {
      return AO__Call($, (splitter as Lifted<unknown>), (separator as Lifted<unknown>), ([O, limit] as Lifted<unknown>[]));
    }

  }

  var S = AO__ToString($, (O as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 476, $.is(limit, $.lit<undefined>(undefined))))
  {
    var lim = $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(32)) as Lifted<number>), ($.lit<number>(1) as Lifted<number>));
  }
  else
  {
    var lim = AO__ToUint32($, (limit as Lifted<unknown>));
  }

  var R = AO__ToString($, (separator as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 477, $.is(lim, $.lit<number>(0))))
  {
    return AO__CreateArrayFromList($, ([] as Lifted<unknown>[]));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 478, $.is(separator, $.lit<undefined>(undefined))))
  {
    return AO__CreateArrayFromList($, ([S] as Lifted<unknown>[]));
  }

  var separatorLength = $.length(R);
  if ($.condition(Number.MAX_SAFE_INTEGER - 479, $.is(separatorLength, $.lit<number>(0))))
  {
    var strLen = $.length(S);
    var outLen = $.clamp(lim, $.lit<number>(0), strLen);
    var head = $.substring(S, ($.lit<number>(0) as Lifted<number>), (outLen as Lifted<number>));
    var codeUnits = $.peek(head).split("").map((c) => $.base<string>(c, [head]));
    return AO__CreateArrayFromList($, (codeUnits as Lifted<unknown>[]));
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 480, $.is(S, $.lit<string>(""))))
  {
    return AO__CreateArrayFromList($, ([S] as Lifted<unknown>[]));
  }

  var substrings = [] as Lifted<never>[];
  var i = $.lit<number>(0);
  var j = AO__StringIndexOf($, (S as Lifted<string>), (R as Lifted<string>), ($.lit<number>(0) as Lifted<number>));
  while (!$.condition(Number.MAX_SAFE_INTEGER - 481, $.is(j, $.lit<string>("not-found"))))
  {
    var T = $.substring(S, (i as Lifted<number>), (j as Lifted<number>));
    $.append(substrings, T)
    if ($.condition(Number.MAX_SAFE_INTEGER - 482, $.is($.base<number>(substrings.length, []), lim)))
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
