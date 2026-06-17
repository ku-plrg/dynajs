// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var sep = "X";
__set_taint__(sep);
var r = a.join(sep);

__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], false);
__assert_taint__(r[3], true);
__assert_taint__(r[4], false);
