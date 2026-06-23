// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "../type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__FindViaPredicate ($ : SpecRuntime, O : Wrapped<unknown>, len : Wrapped<number>, direction : Wrapped<unknown>, predicate : Wrapped<unknown>, thisArg : Wrapped<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 47, $.is(AO__IsCallable($, (predicate as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 48, $.is(direction, $.base<string>("ascending", []))))
  {
    var indices = $.range($.base<number>(0, []), true, len, false, true, Number.MAX_SAFE_INTEGER - 49);
  }
  else
  {
    var indices = $.range($.base<number>(0, []), true, len, false, false, Number.MAX_SAFE_INTEGER - 50);
  }

  for (var k of indices)
  {
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    var testResult = AO__Call($, (predicate as Wrapped<unknown>), (thisArg as Wrapped<unknown>), ([kValue, k, O] as Wrapped<unknown>[]));
    if ($.condition(Number.MAX_SAFE_INTEGER - 51, $.is(AO__ToBoolean($, (testResult as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      return {"Index": k, "Value": kValue};
    }

  }

  return {"Index": $.base<number>(-1, []), "Value": $.base<undefined>(undefined, [])};
}
