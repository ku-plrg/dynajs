// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2, e3];
var r = a.slice(1, 3);

__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
