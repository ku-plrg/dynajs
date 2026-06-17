// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var en = 4;
__set_taint__(en);
var r = a.copyWithin(0, 2, en);

__assert_taint__(r[0], true);
__assert_taint__(r[1], true);
