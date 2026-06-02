// @type concolic
// @oracle false
// @target es5 binary-relational
// @feature syntax aliasing-regression-guard
// REGRESSION GUARD for value-aliasing. The seed (2) equals the literal 2 in
// `x === 2`. The old value-keyed analyzer aliased them and mis-extracted the
// assert as `(x === x)` (trivially valid) -> false `detected` (FP). The current
// FlowAnalysis-based analyzer identity-wraps every value, so the seeded x and
// the literal 2 are distinct: it correctly extracts `(x === 2)`, finds the
// counterexample under PC x > 0, and reports `clean` (TN). If this ever flips
// back to detected/FP, the aliasing bug has regressed.

var x = __symbolic__("x", 2);
if (x > 0) {
  __symbolic_assert__(x === 2);
}
