// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf

var x = "foobar";
var s = "bar";
__set_taint__(s);
__assert_taint__(x.lastIndexOf(s), true);
var s2 = "zzz";
__set_taint__(s2);
__assert_taint__(x.lastIndexOf(s2), false);
