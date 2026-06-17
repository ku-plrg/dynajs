// @type taint
// @target es6+ Array.prototype.forEach
// @feature builtin array-forEach

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = a.forEach(function (v) { return v; });

__assert_taint__(r, false);
