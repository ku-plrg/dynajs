// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt

var x = "hello";
var y = 3;
__set_taint__(y);
var z = x.charAt(y);
__assert_taint__(z, true);