// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes

var x = "foobar";
var p = 3;
__set_taint__(p);
__assert_taint__(x.includes("bar", p), false);
var p2 = 99;
__set_taint__(p2);
__assert_taint__(x.includes("bar", p2), false);
