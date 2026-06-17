// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt

var x = "hello";
var p0 = 3;
__set_taint__(p0);
__assert_taint__(x.charAt(p0), true);
var p1 = 99;
__set_taint__(p1);
__assert_taint__(x.charAt(p1), false);
