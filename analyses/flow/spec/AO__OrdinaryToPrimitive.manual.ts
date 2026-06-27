import type { SpecRuntime, Lifted, Primitive } from "../type.js";

import { AO__Get } from "./AO__Get.js";
import { AO__Call } from "./AO__Call.js";
import { AO__IsCallable } from "./AO__IsCallable.js";

// 7.1.1.1 OrdinaryToPrimitive ( O, hint )
// Every Get/Call goes through the model, so a user valueOf/toString runs in
// lifted-world and returns a lifted primitive — never a native coercion of the
// object (which would re-enter the instrumented method and reject its lifted
// return with "Cannot convert object to primitive value").
export function AO__OrdinaryToPrimitive(
  $: SpecRuntime,
  O: Lifted<unknown>,
  hint: 'string' | 'number',
): Lifted<Primitive> {
  // 1. If hint is "string", then
  //    a. Let methodNames be « "toString", "valueOf" ».
  // 2. Else,
  //    a. Let methodNames be « "valueOf", "toString" ».
  const methodNames =
    hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
  // 3. For each element name of methodNames, do
  for (const name of methodNames) {
    //    a. Let method be ? Get(O, name).
    const method = AO__Get($, O, $.default(name, []));
    //    b. If IsCallable(method) is true, then
    if ($.value(AO__IsCallable($, method))) {
      //       i. Let result be ? Call(method, O).
      const result = AO__Call($, method, O);
      //       ii. If result is not an Object, return result.
      if (!$.value($.isType(result, 'object')))
        return result as Lifted<Primitive>;
    }
  }
  // 4. Throw a TypeError exception.
  throw new TypeError();
}
