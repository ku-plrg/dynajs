// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf

var x = "foobar";
var s = "bar";
__set_taint__(s);
__assert_taint__(x.indexOf(s), true);
var s2 = "zzz";
__set_taint__(s2);
__assert_taint__(x.indexOf(s2), false);
