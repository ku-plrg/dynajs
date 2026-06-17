
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetV } from "./AO__GetV.js";

export function AO__Invoke ($ : SpecRuntime, V : Wrapped<unknown>, P : Wrapped<unknown>, argumentsList : Wrapped<unknown>[] = $.undef) {
  var argumentsListIsPresent = arguments.length > 3;
  if (!argumentsListIsPresent)
  {
    argumentsList = [] as Wrapped<never>[];
  }

  var func = AO__GetV($, (V as Wrapped<unknown>), (P as Wrapped<unknown>));
  return AO__Call($, (func as Wrapped<unknown>), (V as Wrapped<unknown>), (argumentsList as Wrapped<unknown>[]));
}
