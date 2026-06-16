// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt

var x = "hello";
var y = 3;
__set_taint__(y);
var z = x.charCodeAt(y);
__assert_taint__(z, true);