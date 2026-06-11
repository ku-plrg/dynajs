
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__StringPad ($ : BootStrap, S : Wrapped<string>, maxLength : Wrapped<number>, fillString : Wrapped<string>, placement : Wrapped<unknown>) {
  var stringLength = $.length(S);
  if ($.condition(0, $.lessThanEqual(maxLength, stringLength)))
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
