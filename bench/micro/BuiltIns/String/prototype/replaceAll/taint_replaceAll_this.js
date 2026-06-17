// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2 + "..";
var r = x.replaceAll(".", "X");
__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
__assert_taint__(r[4], false);
