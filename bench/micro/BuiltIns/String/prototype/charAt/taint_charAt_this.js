// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
__assert_taint__(x.charAt(0), true);
__assert_taint__(x.charAt(1), false);
__assert_taint__(x.charAt(2), true);
__assert_taint__(x.charAt(99), false);
