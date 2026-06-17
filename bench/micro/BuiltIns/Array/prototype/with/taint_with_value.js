// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

var e0 = "a";
var e1 = "b";
var e2 = "c";
var v = "Z";
__set_taint__(v);
var a = [e0, e1, e2];
var r = a.with(1, v);

__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], false);
