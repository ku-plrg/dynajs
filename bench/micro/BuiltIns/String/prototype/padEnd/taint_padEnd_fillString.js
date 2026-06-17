// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd

var f = "*";
__set_taint__(f);
var x = "hi";
var y = x.padEnd(4, f);
__assert_taint__(y[0], false);
__assert_taint__(y[1], false);
__assert_taint__(y[2], true);
__assert_taint__(y[3], true);
var z = x.padEnd(2, f);
__assert_taint__(z[0], false);
__assert_taint__(z[1], false);
