import type { SpecOps, Wrapped, Unwrapped } from "./type.js";
import { AO } from './ao.js';
import { ModelCapableError } from "./error.js";

export class StringModel {
    ao: AO;

    constructor(public specOps: SpecOps) {
        this.ao = new AO(this.specOps);
    }

    // String.prototype.at(index)
    // done by human
    at(base: Wrapped<string>, index: Wrapped<number>): Wrapped<string> {

        // 1. Let O be ? RequireObjectCoercible(this value).
        // TODO this should be '.peek'ed before coercion
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = O; // ???
        // 3. Let len be the length of S.
        // const len = this.specOps.str.length(S);
        const len = this.specOps.peek(S).length; // ???
        // 4. Let relativeIndex be ? ToIntegerOrInfinity(index).
        const relativeIndex = this.ao.ToIntegerOrInfinity(index);

        // 5. If relativeIndex ≥ 0, then
        let k: number;
        if (relativeIndex >= 0) {
        //    a. Let k be relativeIndex.
            k = relativeIndex;
        // 6. Else,
        } else {
        //    a. Let k be len + relativeIndex.
            k = len + relativeIndex;
        }

        // 7. If k < 0 or k ≥ len, return undefined.
        if (k < 0 || k >= len) {
            return this.specOps.base(undefined, []);
        }

        // 8. Return the substring of S from k to k + 1.
        return this.specOps.substring(S, this.specOps.base(k, []), this.specOps.base(k + 1, []));
    }

    // done by human
    charAt(base: Wrapped<string>, index: Wrapped<number>): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = O // ???
        // 3. Let position be ? ToIntegerOrInfinity(pos).
        const position = this.ao.ToIntegerOrInfinity(index);
        // 4. Let size be the length of S.
        const size = this.specOps.peek(S).length;
        // 5. If position < 0 or position ≥ size, return the empty String.
        if (position < 0 || position >= size) {
            return this.specOps.base('', []);
        }
        // 6. Return the substring of S from position to position + 1.
        const posWrapped = this.specOps.base(position, []);
        const nextPosWrapped = this.specOps.base(position + 1, []);
        return this.specOps.substring(S, posWrapped, nextPosWrapped);
    }

    // done by human
    slice(base: Wrapped<string>, start: Wrapped<number>, end?: Wrapped<number>): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = O; // ???
        // 3. Let len be the length of S.
        const len = this.specOps.peek(S).length;
        // 4. Let intStart be ? ToIntegerOrInfinity(start).
        let intStart = this.ao.ToIntegerOrInfinity(start);
        // 5. If intStart = -∞, let from be 0.
        let from: number;
        if (intStart === -Infinity) from = 0;
        // 6. Else if intStart < 0, let from be max(len + intStart, 0).
        else if (intStart < 0) from = Math.max(len + intStart, 0);
        // 7. Else, let from be min(intStart, len).
        else from = Math.min(intStart, len);
        // 8. If end is undefined, let intEnd be len; else let intEnd be ? ToIntegerOrInfinity(end).
        const intEnd = (end === undefined || this.specOps.peek(end) === undefined) ? len : this.ao.ToIntegerOrInfinity(end);
        // 9. If intEnd = -∞, let to be 0.
        // 10. Else if intEnd < 0, let to be max(len + intEnd, 0).
        // 11. Else, let to be min(intEnd, len).
        let to: number;
        if (intEnd === -Infinity) to = 0;
        else if (intEnd < 0) to = Math.max(len + intEnd, 0);
        else to = Math.min(intEnd, len);
        // 12. If from ≥ to, return the empty String.
        if (from >= to) return this.specOps.base('', []);
        // 13. Return the substring of S from from to to.
        return this.specOps.substring(S, this.specOps.base(from, []), this.specOps.base(to, []));
    }

    // done by ai
    substring(base: Wrapped<string>, start: Wrapped<number>, end?: Wrapped<number>): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = O;
        // 3. Let len be the length of S.
        const len = this.specOps.peek(S).length;
        // 4. Let intStart be ? ToIntegerOrInfinity(start).
        const intStart = this.ao.ToIntegerOrInfinity(start);
        // 5. If end is undefined, let intEnd be len; else let intEnd be ? ToIntegerOrInfinity(end).
        const intEnd = (end === undefined || this.specOps.peek(end) === undefined) ? len : this.ao.ToIntegerOrInfinity(end);
        // 6. Let finalStart be the result of clamping intStart between 0 and len.
        const finalStart = Math.max(0, Math.min(intStart, len));
        // 7. Let finalEnd be the result of clamping intEnd between 0 and len.
        const finalEnd = Math.max(0, Math.min(intEnd, len));
        // 8-9. from = min, to = max.
        const from = Math.min(finalStart, finalEnd);
        const to = Math.max(finalStart, finalEnd);
        // 10. Return the substring of S from from to to.
        return this.specOps.substring(S, this.specOps.base(from, []), this.specOps.base(to, []));
    }

    // done by human
    repeat(base: Wrapped<unknown>, count: Wrapped<unknown>): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = this.ao.ToString(O); // ???
        // 3. Let n be ? ToIntegerOrInfinity(count).
        const n = this.ao.ToIntegerOrInfinity(count);
        // 4. If n < 0 or n = +∞, throw a RangeError exception.
        if (n < 0 || n === Infinity) throw new RangeError('Invalid count value');
        // 5. If n = 0, return the empty String.
        if (n === 0) return this.specOps.base('', []);
        // 6. Return the String value that is made from n copies of S appended together.
        let R = S;
        for (let i = 1; i < n; i++) { R = this.specOps.concatenate(R, S); }
        return R;
    }

    // done by human
    replace(base: Wrapped<string>, searchValue: Wrapped<unknown>, replaceValue: Wrapped<unknown>): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. If searchValue is neither undefined nor null, then
        let searchValueUnwrapped: unknown = this.specOps.peek(searchValue);
        if (searchValueUnwrapped !== undefined && searchValueUnwrapped !== null) {
        //    a. Let replacer be ? GetMethod(searchValue, %Symbol.replace%).
            const replacer = this.ao.GetMethod(searchValue, Symbol.replace);
        //    b. If replacer is not undefined, then
        //       i. Return ? Call(replacer, searchValue, « O, replaceValue »).

            // NOTE
            // if we do this with given `result` - ModelCapableError.raise('this side-effect should already be handled by the caller');
            // else - call?
        }
        // 3. Let string be ? ToString(O).
        const string = O; // ???
        // 4. Let searchString be ? ToString(searchValue).
        const searchString = this.ao.ToString(searchValue);
        // 5. Let functionalReplace be IsCallable(replaceValue).
        const functionalReplace = typeof this.specOps.peek(replaceValue) === 'function';
        // 6. If functionalReplace is false, then
        if (!functionalReplace) {
        //    a. Set replaceValue to ? ToString(replaceValue).
            replaceValue = this.ao.ToString(replaceValue);
        }
        // 7. Let searchLength be the length of searchString.
        const searchLength = this.specOps.peek(searchString).length;
        // 8. Let position be StringIndexOf(string, searchString, 0).
        const position = this.ao.StringIndexOf(string, searchString, 0);
        // 9. If position is not-found, return string.
        if (position === undefined) {
            return string;
        }
        // 10. Let preceding be the substring of string from 0 to position.
        const preceding = this.specOps.substring(string, this.specOps.base(0, []), this.specOps.base(position, []));
        // 11. Let following be the substring of string from position + searchLength.
        const following = this.specOps.substring(string, this.specOps.base(position + searchLength, []), this.specOps.base(this.specOps.peek(string).length, []));
        // 12. If functionalReplace is true, then
        let replacement: Wrapped<string>;
        if (functionalReplace) {
        //     a. Let replacement be ? ToString(? Call(replaceValue, undefined, « searchString, 𝔽(position), string »)).
            // should we call??
            ModelCapableError.raise('TODO');
        }
        // 13. Else,
        else {
            // type _ = AssertType<IsEqual<Wrapped<string>, typeof replaceValue>>;
            //     a. Assert: replaceValue is a String.
            //     b. Let captures be a new empty List.
            let captures: Wrapped<unknown>[] = [];
            //     c. Let replacement be ! GetSubstitution(searchString, string, position, captures, undefined, replaceValue).

            replacement = this.ao.GetSubstitutionValue(searchString, string, position, captures, {}, replaceValue as Wrapped<string>);
        }
        // 14. Return the string-concatenation of preceding, replacement, and following.
        return this.specOps.concatenate(this.specOps.concatenate(preceding, replacement), following);
    }

    // done by human
    concat(base: Wrapped<string>, ...args: Wrapped<string>[]): Wrapped<string> {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = base; // ???
        // 2. Let S be ? ToString(O).
        const S = O; // ???
        // 3. Let R be S.
        let R = S;
        // 4. For each element next of args, do
        for (const next of args) {
        //    a. Let nextString be ? ToString(next).
            const nextString = next; // ???
        //    b. Set R to the string-concatenation of R and nextString.
            R = this.specOps.concatenate(R, nextString);
        }
        // 5. Return R.
        return R;
    }

    // done by ai
    split(base: Wrapped<unknown>, separator: Wrapped<unknown> | undefined, limit: Wrapped<unknown>): Wrapped<string>[] {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = this.ao.RequireObjectCoercible(base);
        // 2. If separator is neither undefined nor null, then
        const separatorUnwrapped = separator === undefined ? undefined : this.specOps.peek(separator);
        if (separatorUnwrapped !== undefined && separatorUnwrapped !== null) {
        //    a. Let splitter be ? GetMethod(separator, %Symbol.split%).
            const splitter = this.ao.GetMethod(separator as Wrapped<unknown>, Symbol.split);
        //    b. If splitter is not undefined, then
        //       i. Return ? Call(splitter, separator, « O, limit »).

            // NOTE
            // if we do this with given `result` - ModelCapableError.raise('this side-effect should already be handled by the caller');
            // else - call?
        }
        // 3. Let S be ? ToString(O).
        const S = O as Wrapped<string>; // ???
        // 4. If limit is undefined, let lim be 2**32 - 1; else let lim be ℝ(? ToUint32(limit)).
        const lim = (limit === undefined || this.specOps.peek(limit) === undefined) ? 2 ** 32 - 1 : this.ao.ToUint32(limit);
        // 5. Let R be ? ToString(separator).
        const R = this.ao.ToString(separator as Wrapped<unknown>);
        // 6. If lim = 0, then
        if (lim === 0) {
        //    a. Return CreateArrayFromList(« »).
            return [];
        }
        // 7. If separator is undefined, then
        if (separator === undefined || this.specOps.peek(separator) === undefined) {
        //    a. Return CreateArrayFromList(« S »).
            return [S];
        }
        // 8. Let separatorLength be the length of R.
        const separatorLength = this.specOps.peek(R).length; // ???
        // 9. If separatorLength = 0, then
        if (separatorLength === 0) {
        //    a. Let strLen be the length of S.
            const strLen = this.specOps.peek(S).length; // ???
        //    b. Let outLen be the result of clamping lim between 0 and strLen.
            const outLen = Math.max(0, Math.min(lim, strLen));
        //    c. Let head be the substring of S from 0 to outLen.
            const head = this.specOps.substring(S, this.specOps.base(0, []), this.specOps.base(outLen, []));
        //    d. Let codeUnits be a List consisting of the sequence of code units that are the elements of head.
            const codeUnits: Wrapped<string>[] = [];
            for (let i = 0; i < outLen; i++) {
                codeUnits.push(this.specOps.substring(head, this.specOps.base(i, []), this.specOps.base(i + 1, [])));
            }
        //    e. Return CreateArrayFromList(codeUnits).
            return codeUnits;
        }
        // 10. If S is the empty String, return CreateArrayFromList(« S »).
        if (this.specOps.peek(S).length === 0) {
            return [S];
        }
        // 11. Let substrings be a new empty List.
        const substrings: Wrapped<string>[] = [];
        // 12. Let i be 0.
        let i = 0;
        // 13. Let j be StringIndexOf(S, R, 0).
        let j = this.ao.StringIndexOf(S, R, 0);
        // 14. Repeat, while j is not not-found,
        while (j !== undefined) {
        //     a. Let T be the substring of S from i to j.
            const T = this.specOps.substring(S, this.specOps.base(i, []), this.specOps.base(j, []));
        //     b. Append T to substrings.
            substrings.push(T);
        //     c. If the number of elements in substrings is lim, return CreateArrayFromList(substrings).
            if (substrings.length === lim) {
                return substrings;
            }
        //     d. Set i to j + separatorLength.
            i = j + separatorLength;
        //     e. Set j to StringIndexOf(S, R, i).
            j = this.ao.StringIndexOf(S, R, i);
        }
        // 15. Let T be the substring of S from i.
        const T = this.specOps.substring(S, this.specOps.base(i, []), this.specOps.base(this.specOps.peek(S).length, []));
        // 16. Append T to substrings.
        substrings.push(T);
        // 17. Return CreateArrayFromList(substrings).
        return substrings;
    }
    
}

