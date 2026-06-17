// @type taint
// @target es5 String.prototype.trim
// @feature builtin trim

var x0 = "a";
var x1 = "b";
var x2 = "c";
__set_taint__(x0);
__set_taint__(x2);
var x = "  " + x0 + x1 + x2 + "  ";
var r = x.trim();
__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
