// @type taint
// @target es6+ String.prototype.trimLeft
// @feature builtin trimLeft

var x0 = "a";
var x1 = "b";
__set_taint__(x0);
var x = "  " + x0 + x1;
var r = x.trimLeft();
__assert_taint__(r[0], true);
__assert_taint__(r[1], false);
