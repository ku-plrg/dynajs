// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr

var x = "hello";
var s0 = 1;
__set_taint__(s0);
var y = x.substr(s0, 3);
__assert_taint__(y, true);

var s1 = 5;
__set_taint__(s1);
var z = x.substr(s1, 3);
__assert_taint__(z, false);
