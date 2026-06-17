// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

var x0 = "f";
var x1 = "o";
var x2 = "o";
var x3 = "b";
var x4 = "a";
__set_taint__(x0);
__set_taint__(x2);
__set_taint__(x4);
var x = x0 + x1 + x2 + x3 + x4;
var y = x.slice(1, 4);
__assert_taint__(y[0], false);
__assert_taint__(y[1], true);
__assert_taint__(y[2], false);
var z = x.slice(4, 4);
__assert_taint__(z, false);
