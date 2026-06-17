// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

var r0 = a.findLastIndex(function (v) { return v === "c"; });
__assert_taint__(r0, true);

var r1 = a.findLastIndex(function (v) { return v === "b"; });
__assert_taint__(r1, false);

var r2 = a.findLastIndex(function (v) { return v === "a"; });
__assert_taint__(r2, true);

var r3 = a.findLastIndex(function (v) { return v === "z"; });
__assert_taint__(r3, false);
