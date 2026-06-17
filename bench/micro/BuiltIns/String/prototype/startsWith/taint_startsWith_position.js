// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith

var x = "foobar";
var p = 3;
__set_taint__(p);
__assert_taint__(x.startsWith("bar", p), false);
var p2 = 99;
__set_taint__(p2);
__assert_taint__(x.startsWith("bar", p2), false);
