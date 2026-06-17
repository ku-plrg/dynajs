// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var fromIndex = 0;
__set_taint__(fromIndex);

__assert_taint__(a.includes("a", fromIndex), false);
__assert_taint__(a.includes("c", fromIndex), false);
