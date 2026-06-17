// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Wrapped, SpecRuntime } from "@/model/type.js";

import { AO__Call } from "./AO__Call.js";
import { AO__Get } from "./AO__Get.js";
import { AO__IsCallable } from "./AO__IsCallable.js";
import { AO__ToBoolean } from "./AO__ToBoolean.js";
import { AO__ToString } from "./AO__ToString.js";

export function AO__FindViaPredicate ($ : SpecRuntime, O : Wrapped<unknown>, len : Wrapped<number>, direction : Wrapped<unknown>, predicate : Wrapped<unknown>, thisArg : Wrapped<unknown>) {
  if ($.condition(Number.MAX_SAFE_INTEGER - 35, $.is(AO__IsCallable($, (predicate as Wrapped<unknown>)), $.base<boolean>(false, []))))
  {
    throw new TypeError;
  }

  if ($.condition(Number.MAX_SAFE_INTEGER - 36, $.is(direction, $.base<string>("ascending", []))))
  {
    var indices = $.IN__IntRange($.base<number>(0, []), true, len, false, true);
  }
  else
  {
    var indices = $.IN__IntRange($.base<number>(0, []), true, len, false, false);
  }

  for (var _x0 = 0; _x0 < indices.length; _x0++)
  {
    var k = indices[_x0];
    var Pk = AO__ToString($, (k as Wrapped<unknown>));
    var kValue = AO__Get($, (O as Wrapped<unknown>), (Pk as Wrapped<unknown>));
    var testResult = AO__Call($, (predicate as Wrapped<unknown>), (thisArg as Wrapped<unknown>), ([kValue, k, O] as Wrapped<unknown>[]));
    if ($.condition(Number.MAX_SAFE_INTEGER - 37, $.is(AO__ToBoolean($, (testResult as Wrapped<unknown>)), $.base<boolean>(true, []))))
    {
      return {"Index": k, "Value": kValue};
    }

  }

  return {"Index": $.base<number>(-1, []), "Value": $.base<undefined>(undefined, [])};
}
