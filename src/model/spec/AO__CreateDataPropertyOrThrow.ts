// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__CreateDataProperty } from "./AO__CreateDataProperty.js";

export function AO__CreateDataPropertyOrThrow ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>, V : Wrapped<unknown>) {
  var success = AO__CreateDataProperty($, (O as Wrapped<unknown>), (P as Wrapped<unknown>), (V as Wrapped<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 18, $.is(success, $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  return $.base<string>("unused", []);
}
