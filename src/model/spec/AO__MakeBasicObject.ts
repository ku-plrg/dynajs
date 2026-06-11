
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__MakeBasicObject ($ : BootStrap, internalSlotsList : Wrapped<string>[]) {
  internalSlotsList = [].concat(internalSlotsList, ["PrivateElements"]);
  throw new Error("YET: Let _obj_ be a newly created object with an internal slot for each name in _internalSlotsList_.")
  obj["PrivateElements"] = [] as Wrapped<never>[];
  throw new Error("YET: Set _obj_'s essential internal methods to the default ordinary object definitions specified in <emu-xref href=\"#sec-ordinary-object-internal-methods-and-internal-slots\"></emu-xref>.")
  if ($.contains(internalSlotsList, "Extensible"))
  {
    obj["Extensible"] = $.base<boolean>(true, []);
  }

  return obj;
}
