// @type taint
// @target es6+ String.prototype.at
// @feature builtin at

var x = "hello";
var y = 3;
__set_taint__(y);
var z = x.at(y);
__assert_taint__(z, true);