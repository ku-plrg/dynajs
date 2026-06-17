// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var e4 = "e";
__set_taint__(e0);
__set_taint__(e2);
__set_taint__(e4);
var a = [e0, e1, e2, e3, e4];
a.copyWithin(0, 3, 5);

__assert_taint__(a[0], false);
__assert_taint__(a[1], true);
__assert_taint__(a[2], true);
__assert_taint__(a[3], false);
__assert_taint__(a[4], true);
