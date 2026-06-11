
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, BootStrap } from "@/model/type.js";

export function AO__ThisStringValue ($ : BootStrap, value : Wrapped<unknown>) {
  if (($.typeOf(value) === "string"))
  {
    return value;
  }

  if ((AO__IsObject($, value)) && ("StringData" in value))
  {
    var s = value["StringData"];
    return s;
  }

  throw new TypeError;
}
