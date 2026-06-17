// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes

var x = "foobar";
var s = "bar";
__set_taint__(s);
__assert_taint__(x.includes(s), false);
var s2 = "zzz";
__set_taint__(s2);
__assert_taint__(x.includes(s2), false);
