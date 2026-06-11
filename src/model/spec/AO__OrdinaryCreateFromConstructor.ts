
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__GetPrototypeFromConstructor } from "./AO__GetPrototypeFromConstructor.js";
import { AO__OrdinaryObjectCreate } from "./AO__OrdinaryObjectCreate.js";

export function AO__OrdinaryCreateFromConstructor ($ : BootStrap, constructor : Wrapped<unknown>, intrinsicDefaultProto : Wrapped<string>, internalSlotsList? : Wrapped<unknown>) {
  var internalSlotsListIsPresent = arguments.length > 2;
  var internalSlotsList = arguments.length > 2 ? arguments[2] : undefined;
  var proto = AO__GetPrototypeFromConstructor($, (constructor as Wrapped<unknown>), (intrinsicDefaultProto as Wrapped<string>));
  if (internalSlotsListIsPresent)
  {
    var slotsList = internalSlotsList;
  }
  else
  {
    var slotsList = [] as Wrapped<never>[];
  }

  return AO__OrdinaryObjectCreate($, (proto as Wrapped<unknown>), (slotsList as Wrapped<unknown>));
}
