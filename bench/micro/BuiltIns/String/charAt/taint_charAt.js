// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt

var x1 = "f";
var x2 = "o";
var x3 = "o";
__set_taint__(x1);
__set_taint__(x3);
var x = x1 + x2 + x3;
var y1 = x.charAt(0);
var y2 = x.charAt(1);
var y3 = x.charAt(2);

__assert_taint__(y1, true);
__assert_taint__(y2, false);
__assert_taint__(y3, true);
