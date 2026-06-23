// @type taint
// @target es6+ Array.isArray
// @feature builtin array-isArray

var e0 = "a";
var e1 = "b";
__set_taint__(e0);
var a = [e0, e1];
var r = Array.isArray(a);

// @witness boolean result, clean
__assert_taint__(r, false);
