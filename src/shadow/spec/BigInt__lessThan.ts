// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { LiftedTransferOps, Lifted, Unlifted } from "../type.js";

export function BigInt__lessThan ($ : LiftedTransferOps, x : Lifted<bigint>, y : Lifted<bigint>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 7, $.lessThan(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
