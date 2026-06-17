
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__Set ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>, V : Wrapped<unknown>, Throw : Wrapped<boolean>) {
  var success = O["Set"](P, V, O);
  if ($.condition(Number.MAX_SAFE_INTEGER - 546, $.is(success, $.base<boolean>(false, []))) && $.condition(Number.MAX_SAFE_INTEGER - 547, $.is(Throw, $.base<boolean>(true, []))))
  {
    throw new TypeError;
  }

  return $.base<string>("unused", []);
}
