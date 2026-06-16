// @type taint
// @target es6+ String.prototype.charCodePointAt
// @feature builtin charCodePointAt

var x = "hello";
var y = 3;
__set_taint__(y);
var z = x.charCodePointAt(y);
__assert_taint__(z, true);