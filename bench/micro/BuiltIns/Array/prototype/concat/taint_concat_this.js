// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat

var e0 = "a";
var e1 = "b";
__set_taint__(e0);
var a = [e0, e1];
var r = a.concat(["c", "d"]);

__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], false);
__assert_taint__(r[3], false);
