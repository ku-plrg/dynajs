
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__CreateArrayFromList } from "./AO__CreateArrayFromList.js";
import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__RequireObjectCoercible } from "./AO__RequireObjectCoercible.js";
import { AO__StringIndexOf } from "./AO__StringIndexOf.js";
import { AO__ToString } from "./AO__ToString.js";
import { AO__ToUint32 } from "./AO__ToUint32.js";

export function INTRINSICS_String_prototype_split ($ : BootStrap, $this : Wrapped<unknown>, separator : Wrapped<unknown>, limit : Wrapped<unknown>) {
  var O = AO__RequireObjectCoercible($, $this);
  if (!($.is(separator, $.base<undefined>(undefined, [])) || $.is(separator, $.base<null>(null, []))))
  {
    var splitter = AO__GetMethod($, (separator as Wrapped<unknown>), ($.base<symbol>(Symbol.split, []) as Wrapped<unknown>));
    if (!$.is(splitter, $.base<undefined>(undefined, [])))
    {
      return AO__Call($, (splitter as Wrapped<unknown>), (separator as Wrapped<unknown>), ([O, limit] as Wrapped<unknown>[]));
    }

  }

  var S = AO__ToString($, (O as Wrapped<unknown>));
  if ($.is(limit, $.base<undefined>(undefined, [])))
  {
    var lim = $.subtract($.exponentiate($.base<number>(2, []), $.base<number>(32, [])), $.base<number>(1, []));
  }
  else
  {
    var lim = AO__ToUint32($, (limit as Wrapped<unknown>));
  }

  var R = AO__ToString($, (separator as Wrapped<unknown>));
  if ($.is(lim, $.base<number>(0, [])))
  {
    return AO__CreateArrayFromList($, ([] as Wrapped<unknown>[]));
  }

  if ($.is(separator, $.base<undefined>(undefined, [])))
  {
    return AO__CreateArrayFromList($, ([S] as Wrapped<unknown>[]));
  }

  var separatorLength = $.length(R);
  if ($.is(separatorLength, $.base<number>(0, [])))
  {
    var strLen = $.length(S);
    var outLen = $.clamp(lim, $.base<number>(0, []), strLen);
    var head = $.substring(S, $.base<number>(0, []), outLen);
    var codeUnits = $.peek(head).split("").map((c) => $.base<string>(c, [head]));
    return AO__CreateArrayFromList($, (codeUnits as Wrapped<unknown>[]));
  }

  if ($.is(S, $.base<string>("", [])))
  {
    return AO__CreateArrayFromList($, ([S] as Wrapped<unknown>[]));
  }

  var substrings = [] as Wrapped<never>[];
  var i = $.base<number>(0, []);
  var j = AO__StringIndexOf($, (S as Wrapped<string>), (R as Wrapped<string>), ($.base<number>(0, []) as Wrapped<number>));
  while (!$.is(j, $.base<string>("not-found", [])))
  {
    var T = $.substring(S, i, j);
    $.append(substrings, T)
    if ($.is($.base<number>(substrings.length, []), lim))
    {
      return AO__CreateArrayFromList($, (substrings as Wrapped<unknown>[]));
    }

    i = $.add(j, separatorLength);
    j = AO__StringIndexOf($, (S as Wrapped<string>), (R as Wrapped<string>), (i as Wrapped<number>));
  }

  var T = $.substring(S, i, $.length(S));
  $.append(substrings, T)
  return AO__CreateArrayFromList($, (substrings as Wrapped<unknown>[]));
}
