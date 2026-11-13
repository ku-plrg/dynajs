// @ts-nocheck
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__ToUint16 } from "./AO__ToUint16.js";

export function INTRINSICS_String_fromCharCode ($ : SpecRuntime, $this : Lifted<unknown>, ...codeUnits : Lifted<unknown>[]) {
  var result = $.default<string>("", []);
  for (var next of codeUnits)
  {
    var nextCU = ((cu: Lifted<unknown>) => $.default<string>(String.fromCharCode($.value(cu) as number), [cu]))(AO__ToUint16($, (next as Lifted<unknown>)));
    result = $.concatenate(result, nextCU);
  }

  return result;
}
