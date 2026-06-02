// @type taint
// @oracle true
// @target es5 String.prototype.replace
// @feature builtin replace-partial
// ported from unit/replace_partial.js

var target = "aYc";
var x = 'X';
__set_taint__(x);
var replaced = target.replace("Y", x);

__print_if_tainted__(replaced);
