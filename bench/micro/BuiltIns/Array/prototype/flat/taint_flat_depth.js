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

// implicit branch: false
__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
__assert_taint__(r[2], false);
