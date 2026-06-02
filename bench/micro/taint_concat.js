// @type taint
// @oracle true
// @target es5 binary-plus
// @feature syntax string-concat
// ported from unit/binary.js

var x = "asdf";
__set_taint__(x);
var y = x + "1234";

__print_if_tainted__(y);
