// @type concolic
// @target es5 string-touppercase
// @feature builtin toUpperCase-unmodeled
// Mirrors ExpoSE unmodeled/bug20, oriented so the concretization is VISIBLE:
// the unmodeled call sits in the GUARD and the assert states one of the guard's
// consequences about the still-symbolic x. toUpperCase(x) === "ABC" forces a
// 3-char input (A/B/C have plain 1:1 case mappings; no special expansions
// produce "ABC"), so x.length === 3 is valid -> detected. An engine that
// concretizes toUpperCase records NO guard constraint (probe: an in-guard
// assert of this very fact comes back violable), so the assert is refuted with
// an empty PC -> clean. The old neg-oracle shape (assert x === "abc") scored
// that same evaporation as a correct TN by accident.

var x = __symbolic__("x", "abc");
if (x.toUpperCase() === "ABC") {
  __symbolic_assert__(x.length === 3, true);
}
