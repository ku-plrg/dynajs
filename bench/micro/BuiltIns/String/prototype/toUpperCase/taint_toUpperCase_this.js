// @type taint
// @target es5 String.prototype.toUpperCase
// @feature builtin toUpperCase

var x0 = "a";
var x1 = "B";
var x2 = "c";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
var r = x.toUpperCase();
__assert_taint__(r.charAt(0), true);
__assert_taint__(r.charAt(1), false);
__assert_taint__(r.charAt(2), true);
