// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__GetIteratorDirect } from "./AO__GetIteratorDirect.js";

export function AO__GetIteratorFromMethod ($ : SpecRuntime, obj : Lifted<unknown>, method : Lifted<unknown>) {
  var iterator = AO__Call($, (method as Lifted<unknown>), (obj as Lifted<unknown>));
  if (!($.value($.condition(Number.MAX_SAFE_INTEGER - 65, $.isType(iterator, "object")))))
  {
    throw new TypeError;
  }

  return AO__GetIteratorDirect($, (iterator as Lifted<unknown>));
}
