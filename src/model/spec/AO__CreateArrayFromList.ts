// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CreateArrayFromList ($ : SpecRuntime, elements : Wrapped<unknown>[]) {
  var array = AO__ArrayCreate($, ($.base<number>(0, []) as Wrapped<number>));
  var n = $.base<number>(0, []);
  for (var _x0 = 0; _x0 < elements.length; _x0++)
  {
    var e = elements[_x0];
    AO__CreateDataPropertyOrThrow($, (array as Wrapped<unknown>), (AO__ToString($, (n as Wrapped<unknown>)) as Wrapped<unknown>), (e as Wrapped<unknown>));
    n = $.add((n as Wrapped<number>), ($.base<number>(1, []) as Wrapped<number>));
  }

  return array;
}
