// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CanonicalNumericIndexString ($ : SpecRuntime, argument : Lifted<string>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 10, $.is(argument, $.lit<string>("-0"))))
  {
    return $.lit<number>(0);
  }

  var n = AO__ToNumber($, (argument as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 11, $.is(AO__ToString($, (n as Lifted<unknown>)), argument)))
  {
    return n;
  }

  return $.lit<undefined>(undefined);
}
