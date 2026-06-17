// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

var x = "hello";
var s0 = 1;
__set_taint__(s0);
var y = x.slice(s0, 4);
__assert_taint__(y, true);

var s1 = 5;
__set_taint__(s1);
var z = x.slice(s1, 5);
__assert_taint__(z, false);
