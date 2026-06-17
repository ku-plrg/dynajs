// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd

var x0 = "f";
var x1 = "o";
__set_taint__(x0);
var x = x0 + x1;
var y = x.padEnd(4, ".");
__assert_taint__(y[0], true);
__assert_taint__(y[1], false);
__assert_taint__(y[2], false);
__assert_taint__(y[3], false);
var z = x.padEnd(1, ".");
__assert_taint__(z[0], true);
__assert_taint__(z[1], false);
