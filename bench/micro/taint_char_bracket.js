// @type taint
// @oracle true
// @target es5 computed-member-access
// @feature syntax string-bracket-index
// ported from unit/string_char_access.js

var x = "abcd";
__set_taint__(x);
var y = x[2];

__print_if_tainted__(y);
