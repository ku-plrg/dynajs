// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__ToUint16 } from "./AO__ToUint16.js";

export function INTRINSICS_String_fromCharCode ($ : SpecRuntime, $this : Wrapped<unknown>, ...codeUnits : Wrapped<unknown>[]) {
  var result = $.base<string>("", []);
  for (var next of codeUnits)
  {
    var nextCU = AO__ToUint16($, (next as Wrapped<unknown>));
    result = $.concatenate(result, $.base<string>(String.fromCharCode($.peek(nextCU)), [nextCU]));
  }

  return result;
}
