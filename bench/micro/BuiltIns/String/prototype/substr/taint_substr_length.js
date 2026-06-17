// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr

var x = "hello";
var n0 = 3;
__set_taint__(n0);
var y = x.substr(1, n0);
__assert_taint__(y, true);

var n1 = 0;
__set_taint__(n1);
var z = x.substr(1, n1);
__assert_taint__(z, false);
