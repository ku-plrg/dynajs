// @type concolic
// @oracle true
// @target es5 arithmetic
// @feature syntax modulo-truncated
// `%` flows symbolically. JS `%` is truncated — the remainder takes the sign of
// the dividend — so -2 % 3 === -2 (not 1). Under the path condition x === -2,
// the assert `x % 3 === -2` is therefore valid: `PC ∧ ¬(x % 3 === -2)` is UNSAT.
//
// This pins down the truncated-modulo encoding: SMT-LIB's `mod` is Euclidean
// (always non-negative), so translating `%` to a bare `mod` would make z3 find
// the spurious counterexample mod(-2,3)=1 and report the assert violable — a
// false negative. The translation instead emits sign(a) * (|a| mod |b|).

var x = __symbolic__("x", -2);
if (x === -2) {
  __symbolic_assert__(x % 3 === -2);
}
