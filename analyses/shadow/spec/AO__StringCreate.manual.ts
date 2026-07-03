import type { LiftedTransferOps, Lifted, Unlifted } from "../type.js";

export function AO__StringCreate ($ : LiftedTransferOps, value : Lifted<string>, prototype : Lifted<unknown>) : Lifted<String> {
  const S = new String($.value(value));
  Object.setPrototypeOf(S, prototype);
  return $.default(S as Unlifted<String>, [value, prototype]) as Lifted<String>;
}