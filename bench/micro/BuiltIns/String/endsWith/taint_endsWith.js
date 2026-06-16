// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith

var x = "foo";
__set_taint__(x);
var y = x.endsWith("o");
__assert_taint__(y, true);