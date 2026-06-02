// @type taint
// @oracle false
// @target es5 String.prototype.charAt
// @feature builtin charAt
// ported from unit/char_at.js

var x = "asdf";
__set_taint__(x);
x = x + "qwer";
var y = x.charAt(4);

__print_if_tainted__(y);
