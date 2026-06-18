// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var idx = 1;
__set_taint__(idx);
var r = a.with(idx, "Z");

// implicit branch: false
__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
__assert_taint__(r[2], false);
