import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "../type.js";

export function AO__ToPrimitive($: SpecRuntime, arg: Wrapped<unknown>, preferredType: Wrapped<'string' | 'number'> | undefined = undefined): Wrapped<Primitive> {
  // 1. If input is an Object, then
  if ($.isType(arg, 'object')) {
    throw new Error('TODO: AO__ToPrimitive for objects');
    //    a. Let exoticToPrim be ? GetMethod(input, %Symbol.toPrimitive%).
    //    b. If exoticToPrim is not undefined, then
    //       i. If preferredType is not present, then
    //          1. Let hint be "default".
    //       ii. Else if preferredType is string, then
    //           1. Let hint be "string".
    //       iii. Else,
    //            1. Assert: preferredType is number.
    //            2. Let hint be "number".
    //       iv. Let result be ? Call(exoticToPrim, input, « hint »).
    //       v. If result is not an Object, return result.
    //       vi. Throw a TypeError exception.
    //    c. If preferredType is not present, let preferredType be number.
    //    d. Return ? OrdinaryToPrimitive(input, preferredType).
  }
  // 2. Return input.
  return arg as Wrapped<Primitive>;
}
