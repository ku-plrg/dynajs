// @type taint
// @target es6+ String.raw
// @feature builtin raw-static

var s = "X";
__set_taint__(s);
var r = String.raw`ab${s}cd`;
__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
__assert_taint__(r[4], false);
