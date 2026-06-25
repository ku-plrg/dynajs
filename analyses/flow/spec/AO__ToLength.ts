// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";

export function AO__ToLength ($ : SpecRuntime, argument : Wrapped<unknown>) {
  var len = AO__ToIntegerOrInfinity($, (argument as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 743, $.lessThanEqual(len, $.lit<number>(0))))
  {
    return $.lit<number>(0);
  }

  return $.min(len, $.subtract(($.exponentiate($.lit<number>(2), $.lit<number>(53)) as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>)));
}
