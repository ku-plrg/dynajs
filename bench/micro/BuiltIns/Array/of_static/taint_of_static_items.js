// @type taint
// @target es6+ Array.of
// @feature builtin array-of

var e0 = "a";
var e1 = "b";
__set_taint__(e0);
var r = Array.of(e0, e1);

__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
