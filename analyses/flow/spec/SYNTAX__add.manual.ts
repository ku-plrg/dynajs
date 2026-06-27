import type { SpecRuntime, Lifted, Primitive } from "../type.js";

import { AO__ToString } from "./AO__ToString.js";
import { AO__ToNumber } from "./AO__ToNumber.js";
import { AO__ToPrimitive } from "./AO__ToPrimitive.js";

function SYNTAX__add_primitive($: SpecRuntime, lPrim: Lifted<Primitive>, rPrim: Lifted<Primitive>): Lifted<string> | Lifted<number> {
  //   c. If lPrim is a String or rPrim is a String, then
  if ($.value($.isType(lPrim, 'string')) || $.value($.isType(rPrim, 'string'))) {
    //     i. Let lStr be ? ToString(lPrim).
    const lStr = AO__ToString($, lPrim);
    //     ii. Let rStr be ? ToString(rPrim).
    const rStr = AO__ToString($, rPrim);
    //     iii. Return the string-concatenation of lStr and rStr.
    return $.concatenate(lStr, rStr);
  }
  //   d. Set lVal to lPrim.
  //   e. Set rVal to rPrim.
  // 2. NOTE: At this point, it must be a numeric operation.
  // 3. Let lNum be ? ToNumeric(lVal).
  const lNum = AO__ToNumber($, lPrim);
  // 4. Let rNum be ? ToNumeric(rVal).
  const rNum = AO__ToNumber($, rPrim);
  // 5. If SameType(lNum, rNum) is false, throw a TypeError exception.
  if (!(typeof $.value(lNum) === typeof $.value(rNum))) {
    throw new TypeError('TypeError: Cannot mix BigInt and other types');
  }
  // 6. If lNum is a BigInt, then
  //   a. Return ? BigInt::add(lNum, rNum). // ???
  // 7. Else,
  //   a. Assert: lNum is a Number.
  //   b. Let operation be Number::add.
  // 8. Return operation(lNum, rNum).
  return $.add(lNum, rNum);

}

// ApplyStringOrNumericBinaryOperator (13.15.3), specialized to opText = `+`
// (split out of the former Model.applyBinary, one file per operator).
export function SYNTAX__add($: SpecRuntime, lVal: Lifted<unknown>, rVal: Lifted<unknown>): Lifted<string> | Lifted<number> {
  // 1.a. Let lPrim be ? ToPrimitive(lval).
  const lPrim = AO__ToPrimitive($, lVal);
  // 1.b. Let rPrim be ? ToPrimitive(rval).
  const rPrim = AO__ToPrimitive($, rVal);
  // Coercing here (not via a native l + r on the raw objects) keeps a user
  // valueOf/toString running in lifted-world; a native + on an object operand
  // would re-enter the instrumented method and reject its lifted-primitive
  // return ("Cannot convert object to primitive value").
  return SYNTAX__add_primitive($, lPrim, rPrim);
}
