// @type taint
// @oracle true
// ported from unit/binary.js

var x = "asdf";
__set_taint__(x);
var y = x + "1234";

__print_if_tainted__(y);
