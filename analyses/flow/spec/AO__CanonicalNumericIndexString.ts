// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CanonicalNumericIndexString ($ : SpecRuntime, argument : Lifted<string>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 13, $.is(argument, $.default<string>("-0", [])))))
  {
    return $.default<number>(0, []);
  }

  var n = AO__ToNumber($, (argument as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 14, $.is(AO__ToString($, (n as Lifted<unknown>)), argument))))
  {
    return n;
  }

  return $.default<undefined>(undefined, []);
}
