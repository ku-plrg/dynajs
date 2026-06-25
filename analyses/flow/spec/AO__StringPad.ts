// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

export function AO__StringPad ($ : SpecRuntime, S : Wrapped<string>, maxLength : Wrapped<number>, fillString : Wrapped<string>, placement : Wrapped<unknown>) {
  var stringLength = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 722, $.lessThanEqual(maxLength, stringLength)))
  {
    return S;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 723, $.is(fillString, $.lit<string>(""))))
  {
    return S;
  }

  var fillLen = $.subtract((maxLength as Wrapped<number>), (stringLength as Wrapped<number>));
  var truncatedStringFiller = $.base(String($.peek(fillString)).repeat(Math.ceil($.peek(fillLen) / String($.peek(fillString)).length)).slice(0, $.peek(fillLen)), [fillString, fillLen]);
  if ($.condition(Number.MAX_SAFE_INTEGER - 724, $.is(placement, $.lit<string>("start"))))
  {
    return $.concatenate(truncatedStringFiller, S);
  }
  else
  {
    return $.concatenate(S, truncatedStringFiller);
  }

}
