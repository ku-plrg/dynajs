// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CreateArrayFromList ($ : SpecRuntime, elements : Wrapped<unknown>[]) {
  var array = AO__ArrayCreate($, ($.lit<number>(0) as Wrapped<number>));
  var n = $.lit<number>(0);
  for (var e of elements)
  {
    AO__CreateDataPropertyOrThrow($, (array as Wrapped<unknown>), (AO__ToString($, (n as Wrapped<unknown>)) as Wrapped<unknown>), (e as Wrapped<unknown>));
    n = $.add((n as Wrapped<number>), ($.lit<number>(1) as Wrapped<number>));
  }

  return array;
}
