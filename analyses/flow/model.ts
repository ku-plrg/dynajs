import type { SpecRuntime } from './type.js';
import * as generated from './spec/index.js';

export class Model {

  // --- static properties and methods ---
  static BUILTINS = new Map<Function, Function>([
    [String.prototype.at, generated.INTRINSICS_String_prototype_at],
    [String.prototype.charAt, generated.INTRINSICS_String_prototype_charAt],
    [String.prototype.charCodeAt, generated.INTRINSICS_String_prototype_charCodeAt],
    [String.prototype.codePointAt, generated.INTRINSICS_String_prototype_codePointAt],
    [String.prototype.concat, generated.INTRINSICS_String_prototype_concat],
    [String.prototype.endsWith, generated.INTRINSICS_String_prototype_endsWith],
    [String.prototype.includes, generated.INTRINSICS_String_prototype_includes],
    [String.prototype.indexOf, generated.INTRINSICS_String_prototype_indexOf],
    [String.prototype.isWellFormed, generated.INTRINSICS_String_prototype_isWellFormed],
    [String.prototype.lastIndexOf, generated.INTRINSICS_String_prototype_lastIndexOf],
    [String.prototype.localeCompare, generated.INTRINSICS_String_prototype_localeCompare],
    [String.prototype.normalize, generated.INTRINSICS_String_prototype_normalize],
    [String.prototype.padEnd, generated.INTRINSICS_String_prototype_padEnd],
    [String.prototype.padStart, generated.INTRINSICS_String_prototype_padStart],
    [String.prototype.repeat, generated.INTRINSICS_String_prototype_repeat],
    [String.prototype.replace, generated.INTRINSICS_String_prototype_replace],
    [String.prototype.replaceAll, generated.INTRINSICS_String_prototype_replaceAll],
    [String.prototype.slice, generated.INTRINSICS_String_prototype_slice],
    [String.prototype.split, generated.INTRINSICS_String_prototype_split],
    [String.prototype.startsWith, generated.INTRINSICS_String_prototype_startsWith],
    [String.prototype.substr, generated.INTRINSICS_String_prototype_substr],
    [String.prototype.substring, generated.INTRINSICS_String_prototype_substring],
    [String.prototype.toUpperCase, generated.INTRINSICS_String_prototype_toUpperCase],
    [String.prototype.toLowerCase, generated.INTRINSICS_String_prototype_toLowerCase],
    [String.prototype.toString, generated.INTRINSICS_String_prototype_toString],
    [String.prototype.toWellFormed, generated.INTRINSICS_String_prototype_toWellFormed],
    [String.prototype.trim, generated.INTRINSICS_String_prototype_trim],
    [String.prototype.trimEnd, generated.INTRINSICS_String_prototype_trimEnd],
    [String.prototype.trimStart, generated.INTRINSICS_String_prototype_trimStart],
    [String.prototype.valueOf, generated.INTRINSICS_String_prototype_valueOf],

    // Annex B HTML wrapper methods.
    [String.prototype.anchor, generated.INTRINSICS_String_prototype_anchor],
    [String.prototype.big, generated.INTRINSICS_String_prototype_big],
    [String.prototype.blink, generated.INTRINSICS_String_prototype_blink],
    [String.prototype.bold, generated.INTRINSICS_String_prototype_bold],
    [String.prototype.fixed, generated.INTRINSICS_String_prototype_fixed],
    [String.prototype.fontcolor, generated.INTRINSICS_String_prototype_fontcolor],
    [String.prototype.fontsize, generated.INTRINSICS_String_prototype_fontsize],
    [String.prototype.italics, generated.INTRINSICS_String_prototype_italics],
    [String.prototype.link, generated.INTRINSICS_String_prototype_link],
    [String.prototype.small, generated.INTRINSICS_String_prototype_small],
    [String.prototype.strike, generated.INTRINSICS_String_prototype_strike],
    [String.prototype.sub, generated.INTRINSICS_String_prototype_sub],
    [String.prototype.sup, generated.INTRINSICS_String_prototype_sup],

    // Regex methods — substituted by the symbolic regex seam ($.regexOp). match
    // and search are kept out of copy-polyfill's esmeta extraction (EXCLUDE), so
    // these manual models are their only registration.
    [RegExp.prototype.test, generated.INTRINSICS_RegExp_prototype_test],
    [RegExp.prototype.exec, generated.INTRINSICS_RegExp_prototype_exec],
    [String.prototype.match, generated.INTRINSICS_String_prototype_match],
    [String.prototype.matchAll, generated.INTRINSICS_String_prototype_matchAll],
    [String.prototype.search, generated.INTRINSICS_String_prototype_search],

    [Array.prototype.at, generated.INTRINSICS_Array_prototype_at],
    [Array.prototype.concat, generated.INTRINSICS_Array_prototype_concat],
    [Array.prototype.copyWithin, generated.INTRINSICS_Array_prototype_copyWithin],
    [Array.prototype.fill, generated.INTRINSICS_Array_prototype_fill],
    [Array.prototype.filter, generated.INTRINSICS_Array_prototype_filter],
    [Array.prototype.find, generated.INTRINSICS_Array_prototype_find],
    [Array.prototype.findIndex, generated.INTRINSICS_Array_prototype_findIndex],
    [Array.prototype.findLast, generated.INTRINSICS_Array_prototype_findLast],
    [Array.prototype.findLastIndex, generated.INTRINSICS_Array_prototype_findLastIndex],
    [Array.prototype.join, generated.INTRINSICS_Array_prototype_join],
    [Array.prototype.map, generated.INTRINSICS_Array_prototype_map],
    [Array.prototype.pop, generated.INTRINSICS_Array_prototype_pop],
    [Array.prototype.push, generated.INTRINSICS_Array_prototype_push],
    [Array.prototype.reduce, generated.INTRINSICS_Array_prototype_reduce],
    [Array.prototype.reduceRight, generated.INTRINSICS_Array_prototype_reduceRight],
    [Array.prototype.shift, generated.INTRINSICS_Array_prototype_shift],
    [Array.prototype.slice, generated.INTRINSICS_Array_prototype_slice],

    [JSON.stringify, generated.INTRINSICS_JSON_stringify],
  ]);

  static SYNTAX = new Map<string, Function>([
    ['+', generated.SYNTAX__add],
  ]);

  static support(f: Function): boolean {
    return this.BUILTINS.has(f);
  }

  static supportSyntax(op: string): boolean {
    return this.SYNTAX.has(op);
  }

  constructor(public $: SpecRuntime) {}

  static ofBuiltin(f: Function): Function {
    const polyfill = Model.BUILTINS.get(f);
    if (polyfill === undefined) {
      throw new Error(`Unsupported built-in function: ${f.name}`);
    }
    return polyfill;
  }

  static ofSyntax(op: string): Function {
    const polyfill = Model.SYNTAX.get(op);
    if (polyfill === undefined) {
      throw new Error(`Unsupported syntax operator: ${op}`);
    }
    return polyfill;
  }

  // // ApplyStringOrNumericBinaryOperator
  // //
  // // (A) post-hoc: the concrete value is the engine's already-computed `result`,
  // // so steps 3-8 below have no executable counterpart yet — we only model the
  // // operand->result info flow. The one case needing structural reconstruction is
  // // string concatenation (1.c), routed through specOps.concatenate to preserve
  // // char-level info. Spec-level splitting of the numeric operations is pending design.
  // static applyBinary(left: Wrapped<unknown>, opText: string, right: Wrapped<unknown>, result: Unwrapped<unknown>): Wrapped<unknown> {
  //   const $ = this.$;
  //   // 1. If opText is +, then
  //   if (opText === '+') {
  //   //   a. Let lPrim be ? ToPrimitive(lVal).
  //       const lPrim = left; // ???
  //       //   b. Let rPrim be ? ToPrimitive(rVal).
  //       const rPrim = right; // ???
  //   //   c. If lPrim is a String or rPrim is a String, then
  //       if (typeof $.peek(lPrim) === 'string' || typeof $.peek(rPrim) === 'string') { // ??? peek to test underlying type
  //       //       i. Let lStr be ? ToString(lPrim).
  //           const lStr = generated.AO__ToString($, lPrim);
  //       //       ii. Let rStr be ? ToString(rPrim).
  //           const rStr = generated.AO__ToString($, rPrim);
  //       //       iii. Return the string-concatenation of lStr and rStr.
  //           return $.concatenate(lStr, rStr);
  //       }
  //   //   d. Set lVal to lPrim.
  //   //   e. Set rVal to rPrim.
  //   }
  //   // 2. NOTE: At this point, it must be a numeric operation.
  //   // 3. Let lNum be ? ToNumeric(lVal).
  //   let lNum = generated.AO__ToNumber($, left); // ???
  //   // 4. Let rNum be ? ToNumeric(rVal).
  //   let rNum = generated.AO__ToNumber($, right); // ???
  //   // 5. If SameType(lNum, rNum) is false, throw a TypeError exception.
  //   if (!( typeof $.peek(lNum) === typeof $.peek(rNum))) {
  //     throw new TypeError('TypeError: Cannot mix BigInt and other types');
  //   }
  //   // 6. If lNum is a BigInt, then
  //   //   a. If opText is **, return ? BigInt::exponentiate(lNum, rNum).
  //   //   b. If opText is /, return ? BigInt::divide(lNum, rNum).
  //   //   c. If opText is %, return ? BigInt::remainder(lNum, rNum).
  //   //   d. If opText is >>>, return ? BigInt::unsignedRightShift(lNum, rNum).
  //   //   e. Let operation be the abstract operation associated with opText in the following table:
  //   //       opText	operation
  //   //       *	BigInt::multiply
  //   //       +	BigInt::add
  //   //       -	BigInt::subtract
  //   //       <<	BigInt::leftShift
  //   //       >>	BigInt::signedRightShift
  //   //       &	BigInt::bitwiseAND
  //   //       ^	BigInt::bitwiseXOR
  //   //       |	BigInt::bitwiseOR
  //   // 7. Else,
  //   //   a. Assert: lNum is a Number.
  //   //   b. Let operation be the abstract operation associated with opText in the following table:
  //   //       opText	operation
  //   //       **	Number::exponentiate
  //   //       *	Number::multiply
  //   //       /	Number::divide
  //   //       %	Number::remainder
  //   //       +	Number::add
  //   //       -	Number::subtract
  //   //       <<	Number::leftShift
  //   //       >>	Number::signedRightShift
  //   //       >>>	Number::unsignedRightShift
  //   //       &	Number::bitwiseAND
  //   //       ^	Number::bitwiseXOR
  //   //       |	Number::bitwiseOR
  //   // 8. Return operation(lNum, rNum).
  //   return $.binary(opText, left, right, result);
  // }

}