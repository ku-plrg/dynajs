// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2 + "bar";
var r = x.replace("bar", "XYZ");
__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
__assert_taint__(r[4], false);
__assert_taint__(r[5], false);
