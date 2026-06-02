// @type taint
// @oracle true
// ported from unit/replace_partial.js

var x = "aXc";
__set_taint__(x);
var y = x.replace("X", "Y");

__print_if_tainted__(y);
