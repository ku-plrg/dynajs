// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var s = 1;
__set_taint__(s);
var r = a.fill("Z", s, 3);

// implicit branch: false
__assert_taint__(r[1], false);
__assert_taint__(r[2], false);
