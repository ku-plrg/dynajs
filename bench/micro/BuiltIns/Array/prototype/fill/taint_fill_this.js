// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2, e3];
a.fill("Z", 1, 3);

__assert_taint__(a[0], true);
__assert_taint__(a[1], false);
__assert_taint__(a[2], false);
__assert_taint__(a[3], false);
