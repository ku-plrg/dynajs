// @type taint
// @oracle ttttffff
// @target es5 String.prototype.replace
// @feature builtin replace-partial
// ported from unit/replace_partial.js

var x = "aXc";
__set_taint__(x);
var y = x.replace("X", "Y");

__print_if_tainted__(y);
