// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat

var base = "ab";
var a0 = "X";
var a1 = "Y";
__set_taint__(a0);
var r = base.concat(a0, a1);
__assert_taint__(r[0], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
