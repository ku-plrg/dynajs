import type { SpecOps, Wrapped, Unwrapped, Primitive } from "./type.js";

export class AO {
  constructor(public specOps: SpecOps) {

  }

  RequireObjectCoercible<T>(value: T): NonNullable<T> {
    if (value === null || value === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return value;
  }

  ToIntegerOrInfinity(value: Wrapped<unknown>): number {
    // 1. Let number be ? ToNumber(argument).
    const number = this.ToNumber(value);
    // 2. If number is one of NaN, +0𝔽, or -0𝔽, return 0.
    if (number !== number || number === 0) {
      return 0;
    }
    // 3. If number is +∞𝔽, return +∞.
    // 4. If number is -∞𝔽, return -∞.
    if (number === Infinity || number === -Infinity) {
      return number;
    }
    // 5. Return truncate(ℝ(number)).
    return Math.trunc(number);
  }

  // Numeric coercions return RAW values: they feed the models' index/length
  // arithmetic and loop bounds (decision values), which must be concrete. A
  // wrapped primitive is a proxy whose `+proxy` is NaN, so wrapping these would
  // silently break every `>= 0` / `< len` / `len + i` (Wrapped<number> is
  // assignable to number, so TS won't catch it). _AO_Contract pins this policy.
  ToNumber(value: Wrapped<unknown>): number {
    // Coerce the underlying value, not the wrapper: wrapped primitives are plain
    // proxy objects, so `+wrapped` is always NaN. Peek first, then ToNumber.
    const raw = this.specOps.peek(value);
    // @ts-ignore unary plus on unknown is the spec's ToNumber coercion.
    return +raw;
  }

  // ToString returns a WRAPPED string: its result flows back into the program
  // (the coerced side of a `+` concatenation), so it must carry info.
  ToString(value: Wrapped<unknown>): Wrapped<string> {
    const raw = this.specOps.peek(value);
    if (typeof raw === 'symbol') { throw new TypeError('Cannot convert a Symbol value to a string'); }
    // Already a String: ToString is the identity. Return the original wrapped
    // value so char-level info survives — re-basing via `base` would collapse it
    // to all-or-nothing (baseInfo doesn't copy the per-char array).
    if (typeof raw === 'string') return value as Wrapped<string>;
    return this.specOps.base(String(raw), [value]);
  }

  ToUint32(value: Wrapped<unknown>): number {
    // 1. Let number be ? ToNumber(argument).
    let number = this.ToNumber(value);
    // 2. If number is not finite or number is either +0𝔽 or -0𝔽, return +0𝔽.
    if (number === Infinity || number === -Infinity || number === 0) {
      return 0;
    }
    // 3. Let int be truncate(ℝ(number)).
    const int = Math.trunc(number);
    // 4. Let int32bit be int modulo 2**32.
    const int32bit = int % (2 ** 32);
    // 5. Return 𝔽(int32bit).
    return int32bit;
  }

  StringIndexOf(string: Wrapped<string>, searchValue: Wrapped<string>, fromIndex: number): number | undefined {
    // 1. Let len be the length of string.
    let len = this.specOps.peek(string).length; // ???
    // 2. If searchValue is the empty String and fromIndex ≤ len, return fromIndex.
    const empty = this.specOps.base('', []);
    const searchValueStr = this.specOps.peek(searchValue);
    if (searchValueStr === '' && fromIndex <= len) {
      return fromIndex;
    }
    // 3. Let searchLen be the length of searchValue.
    let searchLen = this.specOps.peek(searchValue).length; // ???
    // 4. For each integer i such that fromIndex ≤ i ≤ len - searchLen, in ascending order, do
    for (let i = fromIndex; i <= len - searchLen; i++) {
    //     a. Let candidate be the substring of string from i to i + searchLen.
        let candidate = this.specOps.substring(string, this.specOps.base(i, []), this.specOps.base(i + searchLen, []));
    //     b. If candidate is searchValue, return i.
        const left = this.specOps.peek(candidate);
        const right = this.specOps.peek(searchValue);
        // TODO this should be .is instead of ===?
        if (left === right) {
          return i;
        }
    }
    // 5. Return not-found.
    return undefined;
  }

  SameType(x: Wrapped<unknown>, y: Wrapped<unknown>): boolean {
    const xType = typeof this.specOps.peek(x);
    const yType = typeof this.specOps.peek(y);
    return xType === yType;
  }

  ToObject(value: Wrapped<unknown>): Unwrapped<Object> {
    // @ts-ignore ???
    return new Object(this.specOps.peek(value)) as Object;
  }

  GetV(obj: Wrapped<unknown>, key: string | symbol): Unwrapped<unknown | undefined> {
    const V = this.specOps.peek(obj);
    // 1. Let O be ? ToObject(V).
    const O = this.ToObject(obj);
    // 2. Return ? O.[[Get]](P, V).
    return Reflect.get(O, key, V);
  }

  GetMethod(obj: Wrapped<unknown>, key: symbol): Unwrapped<unknown> {
    // 1. Let func be ? GetV(V, P).
    const func : Unwrapped<unknown | undefined> = this.GetV(obj, key);
    // 2. If func is either undefined or null, return undefined.
    if (func === undefined || func === null) {
      return undefined as Unwrapped<undefined>;
    }
    // 3. If IsCallable(func) is false, throw a TypeError exception.
    if (typeof func !== 'function') {
      throw new TypeError('Object is not callable');
    }
    // 4. Return func.
    return func;
  }

  GetSubstitutionValue(matched: Wrapped<string>, str: Wrapped<string>, position: number, captures: Wrapped<unknown>[], namedCaptures: Record<string, Wrapped<unknown>>, replacementTemplate: Wrapped<string>): Wrapped<string> {
    // 1. Let stringLength be the length of str.
    const stringLength = this.specOps.peek(str).length; // ???
    // 2. Assert: position ≤ stringLength.
    // 3. Let result be the empty String.
    let result : Wrapped<string> = this.specOps.base('', []);
    // 4. Let templateRemainder be replacementTemplate.
    let templateRemainder = replacementTemplate;
    // 5. Repeat, while templateRemainder is not the empty String,
    while (this.specOps.peek(templateRemainder) !== '') {
    //    a. NOTE: The following steps isolate ref (a prefix of templateRemainder), determine refReplacement (its replacement), and then append that replacement to result.
        const rem = this.specOps.peek(templateRemainder);
        let ref: Wrapped<string>;
        let refReplacement: Wrapped<string>;
    //    b. If templateRemainder starts with "$$", then
        if (rem.startsWith('$$')) {
    //       i. Let ref be "$$".
            ref = this.specOps.base('$$', []);
    //       ii. Let refReplacement be "$".
            refReplacement = this.specOps.base('$', []);
    //    c. Else if templateRemainder starts with "$`", then
        } else if (rem.startsWith('$`')) {
    //       i. Let ref be "$`".
            ref = this.specOps.base('$`', []);
    //       ii. Let refReplacement be the substring of str from 0 to position.
            refReplacement = this.specOps.substring(str, this.specOps.base(0, []), this.specOps.base(position, []));
    //    d. Else if templateRemainder starts with "$&", then
        } else if (rem.startsWith('$&')) {
    //       i. Let ref be "$&".
            ref = this.specOps.base('$&', []);
    //       ii. Let refReplacement be matched.
            refReplacement = matched;
    //    e. Else if templateRemainder starts with "$'" (0x0024 (DOLLAR SIGN) followed by 0x0027 (APOSTROPHE)), then
        } else if (rem.startsWith("$'")) {
    //       i. Let ref be "$'".
            ref = this.specOps.base("$'", []);
    //       ii. Let matchLength be the length of matched.
            const matchLength = this.specOps.peek(matched).length;
    //       iii. Let tailPos be position + matchLength.
            const tailPos = position + matchLength;
    //       iv. Let refReplacement be the substring of str from min(tailPos, stringLength).
            refReplacement = this.specOps.substring(str, this.specOps.base(Math.min(tailPos, stringLength), []), this.specOps.base(stringLength, []));
    //       v. NOTE: tailPos can exceed stringLength only if this abstract operation was invoked by a call to the intrinsic %Symbol.replace% method of %RegExp.prototype% on an object whose "exec" property is not the intrinsic %RegExp.prototype.exec%.
    //    f. Else if templateRemainder starts with "$" followed by 1 or more decimal digits, then
        } else if (/^\$[0-9]/.test(rem)) {
    //       i. If templateRemainder starts with "$" followed by 2 or more decimal digits, let digitCount be 2. Otherwise, let digitCount be 1.
            let digitCount = /^\$[0-9][0-9]/.test(rem) ? 2 : 1;
    //       ii. Let digits be the substring of templateRemainder from 1 to 1 + digitCount.
            let digits = this.specOps.substring(templateRemainder, this.specOps.base(1, []), this.specOps.base(1 + digitCount, []));
    //       iii. Let index be ℝ(StringToNumber(digits)).
            let index = Number(this.specOps.peek(digits)); // ??? StringToNumber
    //       iv. Assert: 0 ≤ index ≤ 99.
    //       v. Let captureLen be the number of elements in captures.
            const captureLen = captures.length;
    //       vi. If index > captureLen and digitCount = 2, then
            if (index > captureLen && digitCount === 2) {
    //           1. NOTE: When a two-digit replacement pattern specifies an index exceeding the count of capturing groups, it is treated as a one-digit replacement pattern followed by a literal digit.
    //           2. Set digitCount to 1.
                digitCount = 1;
    //           3. Set digits to the substring of digits from 0 to 1.
                digits = this.specOps.substring(digits, this.specOps.base(0, []), this.specOps.base(1, []));
    //           4. Set index to ℝ(StringToNumber(digits)).
                index = Number(this.specOps.peek(digits)); // ??? StringToNumber
            }
    //       vii. Let ref be the substring of templateRemainder from 0 to 1 + digitCount.
            ref = this.specOps.substring(templateRemainder, this.specOps.base(0, []), this.specOps.base(1 + digitCount, []));
    //       viii. If 1 ≤ index ≤ captureLen, then
            if (1 <= index && index <= captureLen) {
    //             1. Let capture be captures[index - 1].
                const capture = captures[index - 1];
    //             2. If capture is undefined, then
                if (capture === undefined) {
    //                a. Let refReplacement be the empty String.
                    refReplacement = this.specOps.base('', []);
    //             3. Else,
                } else {
    //                a. Let refReplacement be capture.
                    refReplacement = capture as Wrapped<string>;
                }
    //       ix. Else,
            } else {
    //           1. Let refReplacement be ref.
                refReplacement = ref;
            }
    //    g. Else if templateRemainder starts with "$<", then
        } else if (rem.startsWith('$<')) {
    //       i. Let gtPos be StringIndexOf(templateRemainder, ">", 0).
            const gtPos = this.StringIndexOf(templateRemainder, this.specOps.base('>', []), 0);
    //       ii. If gtPos is not-found or namedCaptures is undefined, then
            if (gtPos === undefined || namedCaptures === undefined) {
    //           1. Let ref be "$<".
                ref = this.specOps.base('$<', []);
    //           2. Let refReplacement be ref.
                refReplacement = ref;
    //       iii. Else,
            } else {
    //            1. Let ref be the substring of templateRemainder from 0 to gtPos + 1.
                ref = this.specOps.substring(templateRemainder, this.specOps.base(0, []), this.specOps.base(gtPos + 1, []));
    //            2. Let groupName be the substring of templateRemainder from 2 to gtPos.
                const groupName = this.specOps.substring(templateRemainder, this.specOps.base(2, []), this.specOps.base(gtPos, []));
    //            3. Assert: namedCaptures is an Object.
    //            4. Let capture be ? Get(namedCaptures, groupName).
                const capture = namedCaptures[this.specOps.peek(groupName)];
    //            5. If capture is undefined, then
                if (capture === undefined) {
    //               a. Let refReplacement be the empty String.
                    refReplacement = this.specOps.base('', []);
    //            6. Else,
                } else {
    //               a. Let refReplacement be ? ToString(capture).
                    refReplacement = this.ToString(capture);
                }
            }
    //    h. Else,
        } else {
    //       i. Let ref be the substring of templateRemainder from 0 to 1.
            ref = this.specOps.substring(templateRemainder, this.specOps.base(0, []), this.specOps.base(1, []));
    //       ii. Let refReplacement be ref.
            refReplacement = ref;
        }
    //    i. Let refLength be the length of ref.
        const refLength = this.specOps.peek(ref).length;
    //    j. Set templateRemainder to the substring of templateRemainder from refLength.
        templateRemainder = this.specOps.substring(templateRemainder, this.specOps.base(refLength, []), this.specOps.base(this.specOps.peek(templateRemainder).length, []));
    //    k. Set result to the string-concatenation of result and refReplacement.
        result = this.specOps.concatenate(result, refReplacement);
    }
    // 6. Return result.
    return result;
  }
}