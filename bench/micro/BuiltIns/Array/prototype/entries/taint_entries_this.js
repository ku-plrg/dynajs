// @type taint
// @target es6+ Array.prototype.entries
// @feature builtin array-entries

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = [...a.entries()];

__assert_taint__(r[0][0], false);
__assert_taint__(r[0][1], true);
__assert_taint__(r[1][0], false);
__assert_taint__(r[1][1], false);
__assert_taint__(r[2][0], false);
__assert_taint__(r[2][1], true);
