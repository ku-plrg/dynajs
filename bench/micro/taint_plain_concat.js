// @type taint
// @oracle false
// @target es5 binary-plus
// @feature syntax untainted-concat
// ported from unit/plain_concat.js

var a = "asdf";
var b = "1234";
var z = a + b;

__print_if_tainted__(z);
