// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { SpecRuntime, Lifted, Unlifted } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__FindViaPredicate ($ : SpecRuntime, O : Lifted<unknown>, len : Lifted<number>, direction : Lifted<unknown>, predicate : Lifted<unknown>, thisArg : Lifted<unknown>) {
  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 50, $.is(AO__IsCallable($, (predicate as Lifted<unknown>)), $.default<boolean>(false, [])))))
  {
    throw new TypeError;
  }

  if ($.value($.condition(Number.MAX_SAFE_INTEGER - 51, $.is(direction, $.default<string>("ascending", [])))))
  {
    var indices = $.range($.default<number>(0, []), true, len, false, true, Number.MAX_SAFE_INTEGER - 52);
  }
  else
  {
    var indices = $.range($.default<number>(0, []), true, len, false, false, Number.MAX_SAFE_INTEGER - 53);
  }

  for (var k of indices)
  {
    var Pk = AO__ToString($, (k as Lifted<unknown>));
    var kValue = AO__Get($, (O as Lifted<unknown>), (Pk as Lifted<unknown>));
    var testResult = AO__Call($, (predicate as Lifted<unknown>), (thisArg as Lifted<unknown>), ([kValue, k, O] as Lifted<unknown>[]));
    if ($.value($.condition(Number.MAX_SAFE_INTEGER - 54, $.is(AO__ToBoolean($, (testResult as Lifted<unknown>)), $.default<boolean>(true, [])))))
    {
      return {"Index": k, "Value": kValue};
    }

  }

  return {"Index": $.default<number>(-1, []), "Value": $.default<undefined>(undefined, [])};
}
