// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, [e1, e2], e3];
var r = a.flat();

__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
