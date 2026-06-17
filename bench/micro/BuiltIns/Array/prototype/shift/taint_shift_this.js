// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

var r0 = a.shift();
__assert_taint__(r0, true);

var r1 = a.shift();
__assert_taint__(r1, false);

var r2 = a.shift();
__assert_taint__(r2, true);

var empty = [];
var r3 = empty.shift();
__assert_taint__(r3, false);
