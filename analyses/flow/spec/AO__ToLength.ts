// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";

export function AO__ToLength ($ : SpecRuntime, argument : Lifted<unknown>) {
  var len = AO__ToIntegerOrInfinity($, (argument as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 807, $.lessThanEqual(len, $.default<number>(0, [])))))
  {
    return $.default<number>(0, []);
  }

  return $.min(len, $.subtract(($.exponentiate($.default<number>(2, []), $.default<number>(53, [])) as Lifted<number>), ($.default<number>(1, []) as Lifted<number>)));
}
