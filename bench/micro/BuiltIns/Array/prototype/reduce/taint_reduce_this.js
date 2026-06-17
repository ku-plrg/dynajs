// @type taint
// @target es6+ Array.prototype.reduce
// @feature builtin array-reduce

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = a.reduce(function (acc, v) { return acc + v; });

__assert_taint__(r, true);
