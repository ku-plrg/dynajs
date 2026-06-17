// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var en = 3;
__set_taint__(en);
var r = a.fill("Z", 1, en);

__assert_taint__(r[1], true);
__assert_taint__(r[2], true);
