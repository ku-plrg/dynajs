// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function AO__StringPad ($ : SpecRuntime, S : Lifted<string>, maxLength : Lifted<number>, fillString : Lifted<string>, placement : Lifted<unknown>) {
  var stringLength = $.length(S);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 785, $.lessThanEqual(maxLength, stringLength))))
  {
    return S;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 786, $.is(fillString, $.default<string>("", [])))))
  {
    return S;
  }

  var fillLen = $.subtract((maxLength as Lifted<number>), (stringLength as Lifted<number>));
  var truncatedStringFiller = $.substring((Array(Math.ceil($.value(fillLen) / String($.value(fillString)).length)).fill(fillString) as Lifted<string>[]).reduce((a, b) => $.concatenate(a, b)), $.default<number>(0, []), fillLen);
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 787, $.is(placement, $.default<string>("start", [])))))
  {
    return $.concatenate(truncatedStringFiller, S);
  }
  else
  {
    return $.concatenate(S, truncatedStringFiller);
  }

}
