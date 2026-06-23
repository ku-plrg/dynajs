// @type taint
// @target es6+ Array.from
// @feature builtin array-from

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var src = [e0, e1, e2];
var r = Array.from(src, function (v) { return v; });

// @witness e0 = "a" tainted => r[0] = "a" tainted
__assert_taint__(r[0], true);
// @witness always r[1] = "b", clean
__assert_taint__(r[1], false);
// @witness e2 = "c" tainted => r[2] = "c" tainted
__assert_taint__(r[2], true);
