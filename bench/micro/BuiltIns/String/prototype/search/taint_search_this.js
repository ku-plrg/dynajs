// @type taint
// @target es5 String.prototype.search
// @feature builtin search

var x0 = "h";
var x1 = "e";
var x2 = "l";
var x3 = "l";
var x4 = "o";
var x5 = "1";
__set_taint__(x5);
var x = x0 + x1 + x2 + x3 + x4 + x5;
__assert_taint__(x.search(/[0-9]/), true);
__assert_taint__(x.search(/z/), false);
