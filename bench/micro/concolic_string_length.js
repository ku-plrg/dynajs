// @type concolic
// @target es5 string-length
// @feature syntax string-length

var sl_s = __symbolic__("sl_s", "hello");
if (sl_s.length > 3) {
  __symbolic_assert__(sl_s.length >= 4, true);
} else {
  __symbolic_assert__(false, true);
}

var sv_s = __symbolic__("sv_s", "whatever");
if (sv_s.length > 0) {
  __symbolic_assert__(sv_s === "x", false);
} else {
  __symbolic_assert__(false, true);
}
