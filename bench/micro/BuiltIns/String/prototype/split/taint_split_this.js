// @type taint
// @target es5 String.prototype.split
// @feature builtin split

var x0 = "a";
var x1 = "X";
var x2 = "b";
__set_taint__(x0);
var x = x0 + x1 + x2;
var parts = x.split("X");
__assert_taint__(parts[0], true);
__assert_taint__(parts[1], false);
__assert_taint__(parts[0][0], true);
__assert_taint__(parts[1][0], false);
