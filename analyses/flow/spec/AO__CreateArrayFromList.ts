// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ArrayCreate } from "./AO__ArrayCreate.js";
import { AO__CreateDataPropertyOrThrow } from "./AO__CreateDataPropertyOrThrow.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__CreateArrayFromList ($ : SpecRuntime, elements : Lifted<unknown>[]) {
  var array = AO__ArrayCreate($, ($.default<number>(0, []) as Lifted<number>));
  var n = $.default<number>(0, []);
  for (var e of elements)
  {
    AO__CreateDataPropertyOrThrow($, (array as Lifted<unknown>), (AO__ToString($, (n as Lifted<unknown>)) as Lifted<unknown>), (e as Lifted<unknown>));
    n = $.add((n as Lifted<number>), ($.default<number>(1, []) as Lifted<number>));
  }

  return array;
}
