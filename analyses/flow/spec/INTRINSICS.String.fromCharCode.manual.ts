// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

import { AO__ToUint16 } from "./AO__ToUint16.js";

export function INTRINSICS_String_fromCharCode ($ : SpecRuntime, $this : Lifted<unknown>, ...codeUnits : Lifted<unknown>[]) {
  var result = $.base<string>("", []);
  for (var next of codeUnits)
  {
    var nextCU = AO__ToUint16($, (next as Lifted<unknown>));
    result = $.concatenate(result, $.base<string>(String.fromCharCode($.peek(nextCU)), [nextCU]));
  }

  return result;
}
