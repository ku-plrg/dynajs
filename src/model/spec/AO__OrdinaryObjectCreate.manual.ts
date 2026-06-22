// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__OrdinaryObjectCreate ($ : SpecRuntime, proto : Wrapped<unknown>, additionalInternalSlotsList : Wrapped<unknown> = $.undef) {
  // TODO throw error if additionalInternalSlotsList is given - it is not capable of being handled by this implementation
  // should `proto` be deeply unwrapped?
  return Object.create($.peek(proto));
}
