import { AO__ToString } from "./AO__ToString.js";
import { AO__ToNumber } from "./AO__ToNumber.js";

function SYNTAX__add_primitive($: SpecRuntime, lPrim: Wrapped<Primitive>, rPrim: Wrapped<Primitive>): Wrapped<string> | Wrapped<number> {
  //   c. If lPrim is a String or rPrim is a String, then
  if ($.isType(lPrim, 'string') || $.isType(rPrim, 'string')) {
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
  if (!(typeof $.peek(lNum) === typeof $.peek(rNum))) {
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
export function SYNTAX__add($: SpecRuntime, lVal: Wrapped<unknown>, rVal: Wrapped<unknown>): Wrapped<string> | Wrapped<number> {
  if ($.isType(lVal, 'object') || $.isType(rVal, 'object')) {
    const l: Unwrapped<unknown> = $.peek(lVal);
    const r: Unwrapped<unknown> = $.peek(rVal);
    // @ts-expect-error - it calls the plus
    const v = l + r;
    // over-approximate the result type as unknown, since it could be either string or number
    return $.base(v, [lVal, rVal]);
  } else {
    return SYNTAX__add_primitive($, lVal as Wrapped<Primitive>, rVal as Wrapped<Primitive>);
  }
}
