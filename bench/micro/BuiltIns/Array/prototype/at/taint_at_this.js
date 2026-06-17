// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var y0 = a.at(0);
var y1 = a.at(1);
var y2 = a.at(2);
var y3 = a.at(-1);
var y4 = a.at(99);

__assert_taint__(y0, true);
__assert_taint__(y1, false);
__assert_taint__(y2, true);
__assert_taint__(y3, true);
__assert_taint__(y4, false);
