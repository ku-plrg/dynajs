// @type concolic
// @target es5 arithmetic
// @feature syntax arithmetic
// Symbolic integer arithmetic: multiplication and subtraction flow, and JS
// truncated `%` (the remainder's sign follows the dividend) is modeled as
// sign(a)*(|a| mod |b|), not SMT-LIB Euclidean `mod`. Each case uses its own
// symbol so the accumulated path conditions stay independent.

// y = x*2 flows: under y > 8, x >= 5 is necessarily true (valid).
var ar_x = __symbolic__("ar_x", 6);
if (ar_x * 2 > 8) {
  __symbolic_assert__(ar_x >= 5, true);
}

// truncated `%`: -2 % 3 === -2, so under x === -2 the assert x % 3 === -2 is valid
// (a Euclidean-mod translation would find the spurious mod(-2,3)=1 -> false neg).
var mo_x = __symbolic__("mo_x", -2);
if (mo_x === -2) {
  __symbolic_assert__(mo_x % 3 === -2, true);
}

// two symbols: under a > b, the difference a - b is positive (valid).
var tv_a = __symbolic__("tv_a", 8);
var tv_b = __symbolic__("tv_b", 3);
if (tv_a > tv_b) {
  __symbolic_assert__(tv_a - tv_b > 0, true);
}

// truncated `%` can be negative (x = -2 -> -2), so "x % 3 >= 0" is VIOLABLE (clean).
var mn_x = __symbolic__("mn_x", -2);
__symbolic_assert__(mn_x % 3 >= 0, false);
