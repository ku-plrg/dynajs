// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf

var x0 = "h";
var x1 = "e";
var x2 = "l";
var x3 = "l";
var x4 = "o";
__set_taint__(x0);
__set_taint__(x2);
__set_taint__(x4);
var x = x0 + x1 + x2 + x3 + x4;
__assert_taint__(x.lastIndexOf("h"), true);
__assert_taint__(x.lastIndexOf("e"), false);
__assert_taint__(x.lastIndexOf("l"), false);
__assert_taint__(x.lastIndexOf("o"), true);
__assert_taint__(x.lastIndexOf("z"), false);
