// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function AO__OrdinaryObjectCreate ($ : SpecRuntime, proto : Lifted<unknown>, additionalInternalSlotsList : Lifted<unknown> = $.default<undefined>(undefined, [])) {
  /* ModelCapabilityError - additionalInternalSlotsList is not supported */
  return $.default(Object.create($.value(proto)), [proto]);
}
