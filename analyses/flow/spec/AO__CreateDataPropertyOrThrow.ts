// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__CreateDataProperty } from "./AO__CreateDataProperty.js";

export function AO__CreateDataPropertyOrThrow ($ : SpecRuntime, O : Lifted<unknown>, P : Lifted<unknown>, V : Lifted<unknown>) {
  var success = AO__CreateDataProperty($, (O as Lifted<unknown>), (P as Lifted<unknown>), (V as Lifted<unknown>));
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 28, $.is(success, $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  return $.default<string>("unused", []);
}
