// @type taint
// @target es5 String.prototype.toString
// @feature builtin toString

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
var r = x.toString();
__assert_taint__(r.charAt(0), true);
__assert_taint__(r.charAt(1), false);
__assert_taint__(r.charAt(2), true);
