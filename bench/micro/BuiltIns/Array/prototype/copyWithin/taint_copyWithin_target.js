// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var t = 0;
__set_taint__(t);
var r = a.copyWithin(t, 2);

__assert_taint__(r[0], true);
__assert_taint__(r[1], true);
