
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__ValidateNonRevokedProxy } from "./AO__ValidateNonRevokedProxy.js";

export function AO__IsArray ($ : SpecRuntime, argument : Wrapped<unknown>) {
  if (!($.isType(argument, "object")))
  {
    return $.base<boolean>(false, []);
  }

  if (($.isType(argument, "record[array]")))
  {
    return $.base<boolean>(true, []);
  }

  if (($.isType(argument, "record[proxyexoticobject]")))
  {
    AO__ValidateNonRevokedProxy($, (argument as Wrapped<unknown>));
    var proxyTarget = argument["ProxyTarget"];
    return AO__IsArray($, (proxyTarget as Wrapped<unknown>));
  }

  return $.base<boolean>(false, []);
}
