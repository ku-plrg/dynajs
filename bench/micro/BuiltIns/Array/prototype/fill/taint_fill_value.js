// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var v = "Z";
__set_taint__(v);
var a = [e0, e1, e2, e3];
a.fill(v, 1, 3);

__assert_taint__(a[0], false);
__assert_taint__(a[1], true);
__assert_taint__(a[2], true);
__assert_taint__(a[3], false);
