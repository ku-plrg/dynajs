// @type taint
// @oracle false
// @target es5 String.prototype.replace
// @feature builtin replace-partial
// ported from unit/replace_partial.js

var x = "def";
__set_taint__(x);
x = "abc" + x + "gh";
var y = x.replace("def", "Y");

__print_if_tainted__(y);
