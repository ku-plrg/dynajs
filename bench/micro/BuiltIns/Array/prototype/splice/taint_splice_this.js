// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var e4 = "e";
__set_taint__(e0);
__set_taint__(e2);
__set_taint__(e4);
var a = [e0, e1, e2, e3, e4];
a.splice(1, 2);

__assert_taint__(a[0], true);
__assert_taint__(a[1], false);
__assert_taint__(a[2], true);
