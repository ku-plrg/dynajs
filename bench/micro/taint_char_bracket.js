// @type taint
// @oracle true
// ported from unit/string_char_access.js

var x = "abcd";
__set_taint__(x);
var y = x[2];

__print_if_tainted__(y);
