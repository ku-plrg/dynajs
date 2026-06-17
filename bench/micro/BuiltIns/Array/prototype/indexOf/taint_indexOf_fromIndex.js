// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

var a = ["a", "b", "c", "b"];

var f0 = 1;
__set_taint__(f0);
var r0 = a.indexOf("b", f0);
__assert_taint__(r0, true);

var f1 = 10;
__set_taint__(f1);
var r1 = a.indexOf("b", f1);
__assert_taint__(r1, false);
