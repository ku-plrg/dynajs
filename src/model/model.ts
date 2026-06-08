import type { SpecOps, BootStrap, Wrapped, Unwrapped } from './type.js';
import { StringModel } from './string.js';
import { AO } from './ao.js';
import * as generated from './spec/index.js';

export class Model {

  // --- static properties and methods ---
  static SUPPORTED_BUILTINS = new Set<Function>([
    String.prototype.at,
    String.prototype.charAt,
    String.prototype.slice,
    String.prototype.substring,
    String.prototype.concat,
    String.prototype.repeat,
    String.prototype.replace,
    String.prototype.split,
  ]);

  static support(f: Function): boolean {
    return this.SUPPORTED_BUILTINS.has(f);
  }

  // --- instance properties and methods ---
  ao: AO;
  String: StringModel;

  constructor(public specOps: SpecOps, public runtime: BootStrap) {
    this.ao = new AO(specOps);
    this.String = new StringModel(specOps);
  }

  of(f: Function): Function {
    switch (f) {
      // generated polyfill (spec/INTRINSICS.String.prototype.at.ts), threaded with __runtime__
      case String.prototype.at: return generated.INTRINSICS_String_prototype_at;
      case String.prototype.charAt: return generated.INTRINSICS_String_prototype_charAt;
      case String.prototype.slice: return generated.INTRINSICS_String_prototype_slice;
      // case String.prototype.substring: return [this.String.substring.bind(this.String), 'legacy'];
      case String.prototype.concat: return generated.INTRINSICS_String_prototype_concat;
      // case String.prototype.repeat: return [this.String.repeat.bind(this.String), 'legacy'];
      // case String.prototype.replace: return [this.String.replace.bind(this.String), 'legacy'];
      // case String.prototype.split: return [this.String.split.bind(this.String), 'legacy'];
    }
    throw new Error(`Unsupported built-in function: ${f.name}`);
  }

  // syntactic models

  // ApplyStringOrNumericBinaryOperator
  //
  // (A) post-hoc: the concrete value is the engine's already-computed `result`,
  // so steps 3-8 below have no executable counterpart yet — we only model the
  // operand->result info flow. The one case needing structural reconstruction is
  // string concatenation (1.c), routed through specOps.concatenate to preserve
  // char-level info. Spec-level splitting of the numeric operations is pending design.
  applyBinary(left: Wrapped<unknown>, opText: string, right: Wrapped<unknown>, result: Unwrapped<unknown>): Wrapped<unknown> {
    const spec = this.String.specOps;
    // 1. If opText is +, then
    if (opText === '+') {
    //   a. Let lPrim be ? ToPrimitive(lVal).
        const lPrim = left; // ???
        //   b. Let rPrim be ? ToPrimitive(rVal).
        const rPrim = right; // ???
    //   c. If lPrim is a String or rPrim is a String, then
        if (typeof spec.peek(lPrim) === 'string' || typeof spec.peek(rPrim) === 'string') { // ??? peek to test underlying type
        //       i. Let lStr be ? ToString(lPrim).
            const lStr = this.ao.ToString(lPrim); // ???
        //       ii. Let rStr be ? ToString(rPrim).
            const rStr = this.ao.ToString(rPrim); // ???
        //       iii. Return the string-concatenation of lStr and rStr.
            return spec.concatenate(lStr, rStr);
        }
    //   d. Set lVal to lPrim.
    //   e. Set rVal to rPrim.
    }
    // 2. NOTE: At this point, it must be a numeric operation.
    // 3. Let lNum be ? ToNumeric(lVal).
    let lNum = this.ao.ToNumber(left); // ???
    // 4. Let rNum be ? ToNumeric(rVal).
    let rNum = this.ao.ToNumber(right); // ???
    // 5. If SameType(lNum, rNum) is false, throw a TypeError exception.
    if (!( typeof lNum === typeof rNum)) {
      throw new TypeError('TypeError: Cannot mix BigInt and other types');
    }
    // 6. If lNum is a BigInt, then
    //   a. If opText is **, return ? BigInt::exponentiate(lNum, rNum).
    //   b. If opText is /, return ? BigInt::divide(lNum, rNum).
    //   c. If opText is %, return ? BigInt::remainder(lNum, rNum).
    //   d. If opText is >>>, return ? BigInt::unsignedRightShift(lNum, rNum).
    //   e. Let operation be the abstract operation associated with opText in the following table:
    //       opText	operation
    //       *	BigInt::multiply
    //       +	BigInt::add
    //       -	BigInt::subtract
    //       <<	BigInt::leftShift
    //       >>	BigInt::signedRightShift
    //       &	BigInt::bitwiseAND
    //       ^	BigInt::bitwiseXOR
    //       |	BigInt::bitwiseOR
    // 7. Else,
    //   a. Assert: lNum is a Number.
    //   b. Let operation be the abstract operation associated with opText in the following table:
    //       opText	operation
    //       **	Number::exponentiate
    //       *	Number::multiply
    //       /	Number::divide
    //       %	Number::remainder
    //       +	Number::add
    //       -	Number::subtract
    //       <<	Number::leftShift
    //       >>	Number::signedRightShift
    //       >>>	Number::unsignedRightShift
    //       &	Number::bitwiseAND
    //       ^	Number::bitwiseXOR
    //       |	Number::bitwiseOR
    // 8. Return operation(lNum, rNum).
    return spec.base(result, [left, right]);
  }

}