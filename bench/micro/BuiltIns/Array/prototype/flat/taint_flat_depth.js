// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, [e1, [e2]]];
var d = 2;
__set_taint__(d);
var r = a.flat(d);

__assert_taint__(r[0], true);
__assert_taint__(r[1], true);
__assert_taint__(r[2], true);
