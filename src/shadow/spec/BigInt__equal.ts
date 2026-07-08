// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { LiftedTransferOps, Lifted, Unlifted } from "../type.js";

export function BigInt__equal ($ : LiftedTransferOps, x : Lifted<bigint>, y : Lifted<bigint>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 6, $.is(x, y))))
  {
    return $.default<boolean>(true, []);
  }
  else
  {
    return $.default<boolean>(false, []);
  }

}
