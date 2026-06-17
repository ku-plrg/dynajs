// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

var a = ["b", "a", "b", "c"];

var f0 = 2;
__set_taint__(f0);
var r0 = a.lastIndexOf("b", f0);
__assert_taint__(r0, true);

var f1 = -10;
__set_taint__(f1);
var r1 = a.lastIndexOf("b", f1);
__assert_taint__(r1, false);
