// @type taint
// @target es6+ Array.prototype.sort
// @feature builtin array-sort

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e1);
var a = [e0, e1, e2];
var r = a.sort(function (x, y) { return x < y ? 1 : -1; });

__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], true);
