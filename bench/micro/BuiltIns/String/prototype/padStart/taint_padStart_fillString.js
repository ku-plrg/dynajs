// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart

var f = "*";
__set_taint__(f);
var x = "hi";
var y = x.padStart(4, f);
__assert_taint__(y[0], true);
__assert_taint__(y[1], true);
__assert_taint__(y[2], false);
__assert_taint__(y[3], false);
var z = x.padStart(2, f);
__assert_taint__(z[0], false);
__assert_taint__(z[1], false);
