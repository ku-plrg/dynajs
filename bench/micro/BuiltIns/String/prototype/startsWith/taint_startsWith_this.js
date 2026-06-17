// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
__assert_taint__(x.startsWith("foo"), false);
__assert_taint__(x.startsWith("fo"), false);
__assert_taint__(x.startsWith("z"), false);
