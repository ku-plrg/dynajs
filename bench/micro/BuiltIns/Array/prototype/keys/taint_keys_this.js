// @type taint
// @target es6+ Array.prototype.keys
// @feature builtin array-keys

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = [...a.keys()];

__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
__assert_taint__(r[2], false);
