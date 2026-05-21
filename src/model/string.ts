import type { SpecOps } from "./type.js";
import { AO } from './ao.js';

export class StringModel<Str> {
    ao: AO<Str>;

    constructor(public specOps: SpecOps<Str, unknown, unknown, unknown, unknown>) {
        this.ao = new AO(this.specOps);
    }

    // String.prototype.at(index)
    at(base: Str, index: any): Str | undefined {

        // 1. Let O be ? RequireObjectCoercible(this value).
        // TODO this should be '.peek'ed before coercion
        const O = this.ao.RequireObjectCoercible(base);
        // 2. Let S be ? ToString(O).
        const S = O; // ???
        // 3. Let len be the length of S.
        const len = this.specOps.str.length(S);
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
            return undefined;
        }

        // 8. Return the substring of S from k to k + 1.
        return this.specOps.str.substring(S, k, k + 1);
    }

    concat(base: Str, ...args: Str[]): Str {
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
            R = this.specOps.str.concatenate(R, nextString);
        }
        // 5. Return R.
        return R;
    }
    
}

