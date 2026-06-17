// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

var r0 = a.lastIndexOf("a");
__assert_taint__(r0, true);

var r1 = a.lastIndexOf("b");
__assert_taint__(r1, false);

var r2 = a.lastIndexOf("c");
__assert_taint__(r2, true);

var r3 = a.lastIndexOf("z");
__assert_taint__(r3, false);
