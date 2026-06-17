// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith

var x = "foobar";
var s = "foo";
__set_taint__(s);
__assert_taint__(x.startsWith(s), false);
var s2 = "zzz";
__set_taint__(s2);
__assert_taint__(x.startsWith(s2), false);
