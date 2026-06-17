// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf

var x = "barbarfoo";
var p = 3;
__set_taint__(p);
__assert_taint__(x.lastIndexOf("bar", p), true);
var p2 = -1;
__set_taint__(p2);
__assert_taint__(x.lastIndexOf("foo", p2), false);
