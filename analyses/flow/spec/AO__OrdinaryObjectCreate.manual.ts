import type { Lifted, SpecRuntime } from "../type.js";

export function AO__OrdinaryObjectCreate ($ : SpecRuntime, proto : Lifted<unknown>, additionalInternalSlotsList : Lifted<unknown> = $.default(undefined, [])) {
  // TODO throw error if additionalInternalSlotsList is given - it is not capable of being handled by this implementation
  // should `proto` be deeply unlifted?
  return Object.create($.value(proto));
}
