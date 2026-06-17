// @type taint
// @target es6+ String.prototype.blink
// @feature builtin blink

var x0 = "a";
var x1 = "b";
__set_taint__(x0);
var x = x0 + x1;
var r = x.blink();
__assert_taint__(r[0], false);
__assert_taint__(r[7], true);
__assert_taint__(r[8], false);
