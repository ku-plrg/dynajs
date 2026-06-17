// @type taint
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd

var x0 = "a";
var x1 = "b";
var x2 = "c";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2 + "  ";
var r = x.trimEnd();
__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
