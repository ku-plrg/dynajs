
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

export function AO__DeletePropertyOrThrow ($ : SpecRuntime, O : Wrapped<unknown>, P : Wrapped<unknown>) {
  var success = O["Delete"](P);
  if ($.condition(Number.MAX_SAFE_INTEGER - 30, $.is(success, $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  return $.base<string>("unused", []);
}
