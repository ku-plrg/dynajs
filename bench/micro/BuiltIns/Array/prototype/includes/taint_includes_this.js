// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];

__assert_taint__(a.includes(e0), false);
__assert_taint__(a.includes(e1), false);
__assert_taint__(a.includes(e2), false);
__assert_taint__(a.includes("z"), false);
