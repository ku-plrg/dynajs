import type { SpecOps, Wrapped, Unwrapped } from "./type.js";
import { AO } from './ao.js';

export class StringModel {
    ao: AO;

    constructor(public specOps: SpecOps) {
        this.ao = new AO(this.specOps);
    }

    // String.prototype.at(index)
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

    /*
    split(base: Str, separator: Str | undefined, limit: any): Str[] {
        // 1. Let O be ? RequireObjectCoercible(this value).
        const O = base; // ???
        // 2. If separator is neither undefined nor null, then
        if (separator !== undefined && separator !== null) {
        //    a. Let splitter be ? GetMethod(separator, %Symbol.split%).
            const splitter = this.ao.GetMethod(separator, Symbol.split);
        //    b. If splitter is not undefined, then
        //       i. Return ? Call(splitter, separator, « O, limit »).
        }
        // 3. Let S be ? ToString(O).
        const S = O; // ???
        // 4. If limit is undefined, let lim be 2**32 - 1; else let lim be ℝ(? ToUint32(limit)).
        const lim = limit === undefined ? 2 ** 32 - 1 : this.ao.ToUint32(limit);
        // 5. Let R be ? ToString(separator).
        const R = this.ao.ToString(separator);
        // 6. If lim = 0, then
        if (lim === 0) {
        //    a. Return CreateArrayFromList(« »).
            return this.specOps.base([], []);
        }
        // 7. If separator is undefined, then
        else if (separator === undefined) {
        //    a. Return CreateArrayFromList(« S »).
            return this.specOps.base([S], []);
        }
        // 8. Let separatorLength be the length of R.
        const separatorLength = this.specOps.str.length(R);
        // 9. If separatorLength = 0, then
        if (separatorLength === 0) {
        //    a. Let strLen be the length of S.
            const strLen = this.specOps.str.length(S);
        //    b. Let outLen be the result of clamping lim between 0 and strLen.
            const outLen = Math.max(0, Math.min(lim, strLen));
        //    c. Let head be the substring of S from 0 to outLen.
            const head = this.specOps.str.substring(S, 0, outLen);
        //    d. Let codeUnits be a List consisting of the sequence of code units that are the elements of head.
            const codeUnits: Str[] = [];
            for (let k = 0; k < outLen; k++) {
                codeUnits.push(this.specOps.str.substring(head, k, k + 1));
            }
        //    e. Return CreateArrayFromList(codeUnits).
            return this.specOps.base(codeUnits, []);
        }
        // 10. If S is the empty String, return CreateArrayFromList(« S »).
        if (this.specOps.str.is(S, this.specOps.str.empty())) {
            return this.specOps.base([S], []);
        }
        // 11. Let substrings be a new empty List.
        const substrings: Str[] = [];
        // 12. Let i be 0.
        let i = 0;
        // 13. Let j be StringIndexOf(S, R, 0).
        let j = this.ao.StringIndexOf(S, R, 0);
        // 14. Repeat, while j is not not-found,
        while (j !== undefined) {
        //     a. Let T be the substring of S from i to j.
            const T = this.specOps.str.substring(S, i, j);
        //     b. Append T to substrings.
            substrings.push(T);
        //     c. If the number of elements in substrings is lim, return CreateArrayFromList(substrings).
            if (substrings.length === lim) {
                return this.specOps.base(substrings, []);
            }
        //     d. Set i to j + separatorLength.
            i = j + separatorLength;
        //     e. Set j to StringIndexOf(S, R, i).
            j = this.ao.StringIndexOf(S, R, i);
        }
        // 15. Let T be the substring of S from i.
        const T = this.specOps.str.substring(S, i, this.specOps.str.length(S));
        // 16. Append T to substrings.
        substrings.push(T);
        // 17. Return CreateArrayFromList(substrings).
        return this.specOps.base(substrings, []);
    }
        */
    
}

