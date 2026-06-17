// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

var a = ["a", "b", "c"];

var s0 = "b";
__set_taint__(s0);
var r0 = a.lastIndexOf(s0);
__assert_taint__(r0, true);

var s1 = "z";
__set_taint__(s1);
var r1 = a.lastIndexOf(s1);
__assert_taint__(r1, false);
