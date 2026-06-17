// @type concolic
// @target es5 arithmetic
// @feature syntax arithmetic

var ar_x = __symbolic__("ar_x", 6);
if (ar_x * 2 > 8) {
  __symbolic_assert__(ar_x >= 5, true);
} else {
  __symbolic_assert__(false, true);
}

var mo_x = __symbolic__("mo_x", -2);
if (mo_x === -2) {
  __symbolic_assert__(mo_x % 3 === -2, true);
} else {
  __symbolic_assert__(false, true);
}

var tv_a = __symbolic__("tv_a", 8);
var tv_b = __symbolic__("tv_b", 3);
if (tv_a > tv_b) {
  __symbolic_assert__(tv_a - tv_b > 0, true);
} else {
  __symbolic_assert__(false, true);
}

var mn_x = __symbolic__("mn_x", -2);
__symbolic_assert__(mn_x % 3 >= 0, false);
