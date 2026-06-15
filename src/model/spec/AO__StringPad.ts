
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__StringPad ($ : SpecRuntime, S : Wrapped<string>, maxLength : Wrapped<number>, fillString : Wrapped<string>, placement : Wrapped<unknown>) {
  var stringLength = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 120, $.lessThanEqual(maxLength, stringLength)))
  {
    return S;
  }

  if ($.is(fillString, $.base<string>("", [])))
  {
    return S;
  }

  var fillLen = $.subtract(maxLength, stringLength);
  var truncatedStringFiller = $.base(String($.peek(fillString)).repeat(Math.ceil($.peek(fillLen) / String($.peek(fillString)).length)).slice(0, $.peek(fillLen)), [fillString, fillLen]);
  if ($.is(placement, $.base<string>("start", [])))
  {
    return $.concatenate(truncatedStringFiller, S);
  }
  else
  {
    return $.concatenate(S, truncatedStringFiller);
  }

}
