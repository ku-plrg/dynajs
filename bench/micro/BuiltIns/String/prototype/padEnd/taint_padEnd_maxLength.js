// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd

var x = "hi";
var m0 = 5;
__set_taint__(m0);
var y = x.padEnd(m0, ".");
__assert_taint__(y, true);

var m1 = 1;
__set_taint__(m1);
var z = x.padEnd(m1, ".");
__assert_taint__(z, false);
