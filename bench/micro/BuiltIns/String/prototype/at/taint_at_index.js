// @type taint
// @target es6+ String.prototype.at
// @feature builtin at

var x = "hello";
var y0 = 3;
__set_taint__(y0);
var z0 = x.at(y0);
__assert_taint__(z0, true);

var y1 = 99;
__set_taint__(y1);
var z1 = x.at(y1);
__assert_taint__(z1, false);