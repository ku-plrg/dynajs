// @type taint
// @target es6+ Array.prototype.some
// @feature builtin array-some

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

__assert_taint__(a.some(function (v) { return v === "a"; }), false);
__assert_taint__(a.some(function (v) { return v === "z"; }), false);
