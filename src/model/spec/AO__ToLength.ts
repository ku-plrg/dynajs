
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__ToIntegerOrInfinity } from "./AO__ToIntegerOrInfinity.js";

export function AO__ToLength ($ : BootStrap, argument : Wrapped<unknown>) {
  var len = AO__ToIntegerOrInfinity($, (argument as Wrapped<unknown>));
  if ($.condition(0, $.lessThanEqual(len, $.base<number>(0, []))))
  {
    return $.base<number>(0, []);
  }

  return $.min(len, $.subtract($.exponentiate($.base<number>(2, []), $.base<number>(53, [])), $.base<number>(1, [])));
}
