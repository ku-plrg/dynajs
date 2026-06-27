import type { SpecRuntime, Lifted, Primitive } from "../type.js";

import { AO__GetMethod } from "./AO__GetMethod.js";
import { AO__Call } from "./AO__Call.js";
import { AO__OrdinaryToPrimitive } from "./AO__OrdinaryToPrimitive.js";

export function AO__ToPrimitive($: SpecRuntime, arg: Lifted<unknown>, preferredType: Lifted<'string' | 'number' | 'default'> = $.default('default', [])): Lifted<Primitive> {
  // 1. If input is an Object, then
  if ($.value($.isType(arg, 'object'))) {
    //    a. Let exoticToPrim be ? GetMethod(input, %Symbol.toPrimitive%).
    const exoticToPrim = AO__GetMethod($, arg, $.default(Symbol.toPrimitive, []));
    //    b. If exoticToPrim is not undefined, then
    if ($.value(exoticToPrim) !== undefined) {
      //       i–iii. hint is preferredType ("default" | "string" | "number").
      //       iv. Let result be ? Call(exoticToPrim, input, « hint »).
      const result = AO__Call($, exoticToPrim, arg, [preferredType]);
      //       v. If result is not an Object, return result.
      if (!$.value($.isType(result, 'object'))) return result as Lifted<Primitive>;
      //       vi. Throw a TypeError exception.
      throw new TypeError();
    }
    //    c. If preferredType is not present, let preferredType be number.
    const hint = $.value(preferredType) === 'string' ? 'string' : 'number';
    //    d. Return ? OrdinaryToPrimitive(input, preferredType).
    return AO__OrdinaryToPrimitive($, arg, hint);
  }
  // 2. Return input.
  return arg as Lifted<Primitive>;
}
