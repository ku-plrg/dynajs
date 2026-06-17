// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace

var x = "abc";
var v = "YZ";
__set_taint__(v);
var r = x.replace("b", v);
__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
