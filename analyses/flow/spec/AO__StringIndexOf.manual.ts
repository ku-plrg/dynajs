// @manual — hand-authored, survives copy-polyfill regen (the sibling
// AO__StringIndexOf.ts is an auto-generated re-export shim). Replaces the spec's
// linear scan, which a concolic engine cannot model: a concrete-path loop only
// ever returns the single index it walked to, so the not-found (-1) arm is
// unreachable and an `indexOf(...) === -1` query is always unsat. Route through
// the irreducible $.stringIndexOf matcher (z3 `str.indexof`) instead: one
// flippable Int term that is -1 exactly when `searchValue` is absent at/after
// `fromIndex` (already clamped to [0, len] by the caller).
import type { SpecRuntime, Lifted } from "../type.js";

export function AO__StringIndexOf ($ : SpecRuntime, string : Lifted<string>, searchValue : Lifted<string>, fromIndex : Lifted<number>) {
  return $.stringIndexOf(string, searchValue, fromIndex);
}
