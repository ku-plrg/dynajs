// @type taint
// @oracle true
// @target es6+ String.prototype.toLowerCase
// @feature builtin toLowerCase
// ported from unit/toLowerCase.js

var x = "İ";
__set_taint__(x);
var y = x.toLowerCase();

__print_if_tainted__(y[1]);
