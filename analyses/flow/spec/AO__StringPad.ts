// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__StringPad ($ : SpecRuntime, S : Lifted<string>, maxLength : Lifted<number>, fillString : Lifted<string>, placement : Lifted<unknown>) {
  var stringLength = $.length(S);
  if ($.condition(Number.MAX_SAFE_INTEGER - 722, $.lessThanEqual(maxLength, stringLength)))
  {
    return S;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 723, $.is(fillString, $.lit<string>(""))))
  {
    return S;
  }

  var fillLen = $.subtract((maxLength as Lifted<number>), (stringLength as Lifted<number>));
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
