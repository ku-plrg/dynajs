// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf

var x = "foobarbar";
var p = 4;
__set_taint__(p);
__assert_taint__(x.indexOf("bar", p), true);
var p2 = 99;
__set_taint__(p2);
__assert_taint__(x.indexOf("bar", p2), false);
