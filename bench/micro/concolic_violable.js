// @type concolic
// @oracle false
// @target es5 binary-relational
// @feature syntax counterexample
// The path condition x > 0 does not pin x to 2: e.g. x = 1 satisfies the PC but
// breaks `x === 2`, so `PC ∧ ¬(x === 2)` is SAT -> the assert is not valid.

// NB: seed (7) must differ from every literal here — symbolic identity is keyed
// by concrete value, so seeding x = 2 would alias the literal 2 in `x === 2`.
var x = __symbolic__("x", 7);
if (x > 0) {
  __symbolic_assert__(x === 2);
}
