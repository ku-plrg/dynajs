// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat

var x = "ab";
var c0 = 3;
__set_taint__(c0);
var y = x.repeat(c0);
__assert_taint__(y, true);

var c1 = 0;
__set_taint__(c1);
var z = x.repeat(c1);
__assert_taint__(z, false);
