// @type taint
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase

var x0 = "A";
var x1 = "b";
var x2 = "C";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
var r = x.toLocaleLowerCase();
__assert_taint__(r.charAt(0), true);
__assert_taint__(r.charAt(1), false);
__assert_taint__(r.charAt(2), true);
