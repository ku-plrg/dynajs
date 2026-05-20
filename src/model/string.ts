import type { StringOps } from './type.js';
import { AO } from './ao.js';

// String.prototype.at(index)
export function at<Str>(ops: StringOps<Str>, base: Str, index: any): Str | undefined {
    console.log('DEBUG', 'String.prototype.at', { base, index });

    const ao = new AO(ops);

    // 1. Let O be ? RequireObjectCoercible(this value).
    ao.RequireObjectCoercible(base);
    // 2. Let S be ? ToString(O).
    const S = base; // ???
    // 3. Let len be the length of S.
    const len = ops.length(S);
    // 4. Let relativeIndex be ? ToIntegerOrInfinity(index).
    const relativeIndex = ao.ToIntegerOrInfinity(index);

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
        return undefined;
    }

    // 8. Return the substring of S from k to k + 1.
    return ops.substring(S, k, k + 1);
}

// String.prototype.substring(start, end?)
export function substring<T>(ops: StringOps<T>, base: T, start: any, end?: any): T {
    const ao = new AO(ops);

    // 1. Let O be ? RequireObjectCoercible(this value).
    ao.RequireObjectCoercible(base);
    // 2. Let S be ? ToString(O).
    const S = base;
    // 3. Let len be the length of S.
    const len = ops.length(S);
    // 4. Let intStart be ? ToIntegerOrInfinity(start).
    const intStart = ao.ToIntegerOrInfinity(start);
    // 5. If end is undefined, let intEnd be len; else let intEnd be ? ToIntegerOrInfinity(end).
    const intEnd = end === undefined ? len : ao.ToIntegerOrInfinity(end);
    // 6. Let finalStart be the result of clamping intStart between 0 and len.
    const finalStart = Math.min(Math.max(intStart, 0), len);
    // 7. Let finalEnd be the result of clamping intEnd between 0 and len.
    const finalEnd = Math.min(Math.max(intEnd, 0), len);
    // 8. Let from be min(finalStart, finalEnd).
    const from = Math.min(finalStart, finalEnd);
    // 9. Let to be max(finalStart, finalEnd).
    const to = Math.max(finalStart, finalEnd);
    // 10. Return the substring of S from from to to.
    return ops.substring(S, from, to);
}

// String.prototype.split(separator, limit)
// separator is lifted into T by the caller (or undefined for the spec's
// "separator is undefined" branch).
export function split<T>(
    ops: StringOps<T>,
    base: T,
    separator: T | undefined,
    limit?: number,
): T[] {
    const ao = new AO(ops);

    // 1. Let O be ? RequireObjectCoercible(this value).
    ao.RequireObjectCoercible(base);
    // (2 skipped — string separator only; Symbol.split / RegExp not modeled.)
    // 3. Let S be ? ToString(O).
    const S = base;
    // 4. If limit is undefined, let lim be 2**32 - 1; else let lim be ℝ(? ToUint32(limit)).
    const lim = limit === undefined ? 2 ** 32 - 1 : ao.ToUint32(limit);
    // 5. Let R be ? ToString(separator). (caller-lifted)
    // 6. If lim = 0, then
    //    a. Return CreateArrayFromList(« »).
    if (lim === 0) return [];
    // 7. If separator is undefined, then
    //    a. Return CreateArrayFromList(« S »).
    if (separator === undefined) return [S];
    const R = separator;
    // 8. Let separatorLength be the length of R.
    const separatorLength = ops.length(R);
    // 9. If separatorLength = 0, then
    if (separatorLength === 0) {
    //    a. Let strLen be the length of S.
        const strLen = ops.length(S);
    //    b. Let outLen be the result of clamping lim between 0 and strLen.
        const outLen = Math.min(Math.max(lim, 0), strLen);
    //    c–e. Slice each code unit into its own element.
        const result: T[] = [];
        for (let i = 0; i < outLen; i++) {
            result.push(ops.substring(S, i, i + 1));
        }
        return result;
    }
    // 10. If S is the empty String, return CreateArrayFromList(« S »).
    if (ops.length(S) === 0) return [S];
    // 11. Let substrings be a new empty List.
    const substrings: T[] = [];
    // 12. Let i be 0.
    let i = 0;
    // 13. Let j be StringIndexOf(S, R, 0).
    let j = ao.StringIndexOf(S, R, 0);
    // 14. Repeat, while j is not not-found,
    while (j !== undefined) {
    //     a. Let T be the substring of S from i to j.
        const seg = ops.substring(S, i, j);
    //     b. Append T to substrings.
        substrings.push(seg);
    //     c. If the number of elements in substrings is lim, return CreateArrayFromList(substrings).
        if (substrings.length === lim) return substrings;
    //     d. Set i to j + separatorLength.
        i = j + separatorLength;
    //     e. Set j to StringIndexOf(S, R, i).
        j = ao.StringIndexOf(S, R, i);
    }
    // 15. Let T be the substring of S from i.
    // 16. Append T to substrings.
    substrings.push(ops.substring(S, i, ops.length(S)));
    // 17. Return CreateArrayFromList(substrings).
    return substrings;
}

// String.prototype.replace(searchValue, replaceValue)
// Both searchValue and replaceValue are lifted into T by the caller.
export function replace<T>(
    ops: StringOps<T>,
    base: T,
    searchValue: T,
    replaceValue: T,
): T {
    const ao = new AO(ops);

    // 1. Let O be ? RequireObjectCoercible(this value).
    ao.RequireObjectCoercible(base);
    // (2 skipped — Symbol.replace dispatch not modeled.)
    // 3. Let string be ? ToString(O). (caller-lifted)
    const S = base;
    // 4. Let searchString be ? ToString(searchValue). (caller-lifted)
    const searchString = searchValue;
    // (5/6 skipped — functional replaceValue not supported; caller-coerced.)
    // 7. Let searchLength be the length of searchString.
    const searchLength = ops.length(searchString);
    // 8. Let position be StringIndexOf(string, searchString, 0).
    const position = ao.StringIndexOf(S, searchString, 0);
    // 9. If position is not-found, return string.
    if (position === undefined) return S;
    // 10. Let preceding be the substring of string from 0 to position.
    const preceding = ops.substring(S, 0, position);
    // 11. Let following be the substring of string from position + searchLength.
    const following = ops.substring(S, position + searchLength, ops.length(S));
    // 12/13. Compute replacement.
    const replacementParts = getSubstitution(ops, S, searchString, position, replaceValue);
    // 14. Return the string-concatenation of preceding, replacement, and following.
    return [preceding, ...replacementParts, following].reduce(
        (acc, cur) => ops.concatenate(acc, cur),
    );
}

function getSubstitution<T>(
    _ops: StringOps<T>,
    _base: T,
    _searchString: T,
    _position: number,
    _replaceValue: T,
): T[] {
    // TODO
    return [];
}
