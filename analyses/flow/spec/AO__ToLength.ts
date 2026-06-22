// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";

export function AO__ToLength ($ : SpecRuntime, argument : Wrapped<unknown>) {
  var len = AO__ToIntegerOrInfinity($, (argument as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 611, $.lessThanEqual(len, $.base<number>(0, []))))
  {
    return $.base<number>(0, []);
  }

  return $.min(len, $.subtract(($.exponentiate($.base<number>(2, []), $.base<number>(53, [])) as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>)));
}
