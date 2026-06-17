
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__ValidateNonRevokedProxy ($ : SpecRuntime, proxy : Wrapped<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 620, $.is(proxy["ProxyTarget"], $.base<null>(null, []))))
  {
    throw new TypeError;
  }

  return $.base<string>("unused", []);
}
