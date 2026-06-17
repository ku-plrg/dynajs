// @type taint
// @target es6+ Array.prototype.every
// @feature builtin array-every

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

__assert_taint__(a.every(function (v) { return typeof v === "string"; }), false);
__assert_taint__(a.every(function (v) { return v === "a"; }), false);
