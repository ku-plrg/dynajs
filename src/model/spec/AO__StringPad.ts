
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
  throw new Error("YET: Let _truncatedStringFiller_ be the String value consisting of repeated concatenations of _fillString_ truncated to length _fillLen_.")
  if ($.is(placement, $.base<string>("start", [])))
  {
    return $.concatenate(truncatedStringFiller, S);
  }
  else
  {
    return $.concatenate(S, truncatedStringFiller);
  }

}
