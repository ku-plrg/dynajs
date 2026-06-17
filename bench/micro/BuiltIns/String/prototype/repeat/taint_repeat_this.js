// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat

var x0 = "a";
var x1 = "b";
__set_taint__(x0);
var x = x0 + x1;
var y = x.repeat(2);
__assert_taint__(y[0], true);
__assert_taint__(y[1], false);
__assert_taint__(y[2], true);
__assert_taint__(y[3], false);
var z = x.repeat(0);
__assert_taint__(z, false);
