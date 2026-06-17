// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
__assert_taint__(x.includes("foo"), false);
__assert_taint__(x.includes("oo"), false);
__assert_taint__(x.includes("z"), false);
