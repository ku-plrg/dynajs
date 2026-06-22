// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CanonicalNumericIndexString ($ : SpecRuntime, argument : Wrapped<string>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 7, $.is(argument, $.base<string>("-0", []))))
  {
    return $.base<number>(0, []);
  }

  var n = AO__ToNumber($, (argument as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 8, $.is(AO__ToString($, (n as Wrapped<unknown>)), argument)))
  {
    return n;
  }

  return $.base<undefined>(undefined, []);
}
