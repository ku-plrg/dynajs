import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

import { AO__ToNumber } from "./AO__ToNumber.js";

export function AO__ToUint32($: SpecRuntime, arg: Lifted<unknown>): Lifted<number> {
  // 1. Let _number_ be ? ToNumber(_argument_).
  let number = AO__ToNumber($, arg);
  let numberUnlifted = $.value(number);
  // 1. If _number_ is not finite or _number_ is either *+0*<sub>𝔽</sub> or *-0*<sub>𝔽</sub>, return *+0*<sub>𝔽</sub>.
  if (!Number.isFinite(numberUnlifted) || numberUnlifted === 0) {
    return $.default(0, [arg]);
  }
  // 1. Let _int_ be truncate(ℝ(_number_)).
  let int_ = Math.trunc(numberUnlifted);
  // 1. Let _int32bit_ be _int_ modulo 2<sup>32</sup>.
  var MOD = 4294967296; // 2^32
  let int32bit = ((int_ % MOD) + MOD) % MOD;
  // 1. [id="step-touint32-return"] Return 𝔽(_int32bit_).
  return $.default(int32bit, [arg]);
}
