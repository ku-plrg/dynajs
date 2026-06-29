import type { SpecRuntime, Lifted, Unlifted, Primitive } from "../type.js";

export function AO__ArrayCreate($ : SpecRuntime, length : Lifted<number>, proto: Lifted<unknown> = $.default(undefined, [])): Lifted<unknown> {
  const len = $.value(length);
  // 1. If length > 2**32 - 1, throw a RangeError exception.
  if (len > 2 ** 32 - 1) {
    throw new RangeError("AO__ArrayCreate : length is too large");
  }
  // 2. If proto is not present, set proto to %Array.prototype%.
  // short-path:
  if ($.is(proto, $.default(undefined, []))) return $.default(new Array(len) as Unlifted<Array<unknown>>, []);

  // 3. Let A be ! ArrayCreate(length).
  const A = $.default(new Array(len) as Unlifted<Array<unknown>>, []);
  Object.setPrototypeOf($.value(A), $.value(proto));
  return A;
}