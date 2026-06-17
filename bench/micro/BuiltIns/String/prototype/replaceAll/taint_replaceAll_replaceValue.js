// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll

var x = "a.b.c";
var v = "Z";
__set_taint__(v);
var r = x.replaceAll(".", v);
__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], false);
__assert_taint__(r[3], true);
__assert_taint__(r[4], false);
