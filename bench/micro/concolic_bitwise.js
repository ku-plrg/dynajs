// @type concolic
// @target es5 bitwise
// @feature syntax bitwise

var ba_x = __symbolic__("ba_x", 3);
if ((ba_x & 1) === 1) {
  __symbolic_assert__(ba_x !== 2, true);
} else {
  __symbolic_assert__(false, true);
}

var ls_x = __symbolic__("ls_x", 1);
if (ls_x << 31 < 0) {
  __symbolic_assert__(ls_x <= 0, false);
} else {
  __symbolic_assert__(false, true);
}

var rs_x = __symbolic__("rs_x", -1);
if (rs_x >>> 0 > 2000000000) {
  __symbolic_assert__(rs_x >= 0, false);
} else {
  __symbolic_assert__(false, true);
}
