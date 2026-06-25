// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__OrdinaryObjectCreate ($ : SpecRuntime, proto : Lifted<unknown>, additionalInternalSlotsList : Lifted<unknown> = $.undef) {
  // TODO throw error if additionalInternalSlotsList is given - it is not capable of being handled by this implementation
  // should `proto` be deeply unlifted?
  return Object.create($.peek(proto));
}
