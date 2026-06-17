// @type taint
// @target es6+ Array.prototype.flatMap
// @feature builtin array-flatMap

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = a.flatMap(function (v) { return [v]; });

__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
