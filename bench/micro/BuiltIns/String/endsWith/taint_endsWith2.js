// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith

var x = "foo";
var y = "o";
__set_taint__(y);
var z = x.endsWith(y);
__assert_taint__(z, true);