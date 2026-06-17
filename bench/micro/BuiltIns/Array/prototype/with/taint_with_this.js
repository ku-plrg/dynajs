// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2, e3];
var r = a.with(1, "Z");

__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
