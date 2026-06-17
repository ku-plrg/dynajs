// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

var r0 = a.findLast(function (v) { return v === "c"; });
__assert_taint__(r0, true);

var r1 = a.findLast(function (v) { return v === "b"; });
__assert_taint__(r1, false);

var r2 = a.findLast(function (v) { return v === "z"; });
__assert_taint__(r2, false);
