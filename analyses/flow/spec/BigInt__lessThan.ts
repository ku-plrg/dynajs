// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

export function BigInt__lessThan ($ : SpecRuntime, x : Lifted<bigint>, y : Lifted<bigint>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 7, $.lessThan(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
