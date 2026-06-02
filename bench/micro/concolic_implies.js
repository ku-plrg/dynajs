// @type concolic
// @oracle true
// @target es5 binary-relational
// @feature syntax path-implies-assert
// Under the path condition x > 0 (over the integers), x >= 1 is necessarily
// true, so `PC ∧ ¬(x >= 1)` is UNSAT -> the assert is provably valid.

var x = __symbolic__("x", 5);
if (x > 0) {
  __symbolic_assert__(x >= 1);
}
