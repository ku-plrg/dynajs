// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__CreateDataProperty } from "./AO__CreateDataProperty.js";

export function AO__CreateDataPropertyOrThrow ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>, V : Lifted<unknown>) {
  var success = AO__CreateDataProperty($, (O as Lifted<unknown>), (P as Lifted<unknown>), (V as Lifted<unknown>));
  if ($.condition(Number.MAX_SAFE_INTEGER - 25, $.is(success, $.lit<boolean>(false))))
  {
    throw new TypeError;
  }

  return $.lit<string>("unused");
}
