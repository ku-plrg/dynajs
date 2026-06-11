
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

import { AO__MakeBasicObject } from "./AO__MakeBasicObject.js";

export function AO__OrdinaryObjectCreate ($ : BootStrap, proto : Wrapped<unknown>, additionalInternalSlotsList? : Wrapped<unknown>) {
  var additionalInternalSlotsListIsPresent = arguments.length > 1;
  var additionalInternalSlotsList = arguments.length > 1 ? arguments[1] : undefined;
  var internalSlotsList = ["Prototype", "Extensible"];
  if (additionalInternalSlotsListIsPresent)
  {
    internalSlotsList = [].concat(internalSlotsList, additionalInternalSlotsList);
  }

  var O = AO__MakeBasicObject($, (internalSlotsList as Wrapped<string>[]));
  O["Prototype"] = proto;
  return O;
}
