// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace

var x = "hello world";
var s = "world";
__set_taint__(s);
var r = x.replace(s, "there");
__assert_taint__(r[6], true);
__assert_taint__(r[7], true);
