// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

var r0 = a.indexOf("a");
__assert_taint__(r0, true);

var r1 = a.indexOf("b");
__assert_taint__(r1, false);

var r2 = a.indexOf("c");
__assert_taint__(r2, true);

var r3 = a.indexOf("z");
__assert_taint__(r3, false);
