// @type taint
// @target es6+ String.prototype.at
// @feature builtin at

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
var y0 = x.at(0);
var y1 = x.at(1);
var y2 = x.at(2);
var y3 = x.at(999);

__assert_taint__(y0, true);
__assert_taint__(y1, false);
__assert_taint__(y2, true);
__assert_taint__(y3, false);
