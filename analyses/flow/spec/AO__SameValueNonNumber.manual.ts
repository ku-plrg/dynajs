
// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
import type { Lifted, SpecRuntime } from "../type.js";

export function AO__SameValueNonNumber ($ : SpecRuntime, xW : Lifted<unknown>, yW : Lifted<unknown>): Lifted<boolean> {
  const x = $.value(xW);
  const y = $.value(yW);

  // 1. Assert: SameType(_x_, _y_) is *true*.
  // 1. If _x_ is either *null* or *undefined*, return *true*.
  if (x === undefined || x === null) return $.default<boolean>(true, []);
  // 1. If _x_ is a BigInt, then
  if (typeof x === "bigint") {
    // 1. Return BigInt::equal(_x_, _y_).
    return $.default<boolean>(x === y, []);
  }
  // 1. If _x_ is a String, then
  if (typeof x === "string") {
    // 1. If _x_ and _y_ have the same length and the same code units in the same positions, return *true*; otherwise, return *false*.
    // `x === y` (both already raw): String(y) would re-coerce a non-string `y`
    // natively (→ "Cannot convert object to primitive value") should y ever be a
    // mismatched type here.
    return $.default<boolean>(x === y, []);
  }
  // 1. If _x_ is a Boolean, then
  if (typeof x === "boolean") {
    // 1. If _x_ and _y_ are both *true* or both *false*, return *true*; otherwise, return *false*.
    // @ts-ignore coerce
    if ((x === true && y === true) || (x === false && y === false)) return $.default<boolean>(true, []);
    return $.default<boolean>(false, []);
  }
  // 1. NOTE: All other ECMAScript language values are compared by identity.
  // 1. If _x_ is _y_, return *true*; otherwise, return *false*.
  return $.default<boolean>(x === y, []);
}
