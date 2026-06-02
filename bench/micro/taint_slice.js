// @type taint
// @oracle true
// @target es5 String.prototype.slice
// @feature builtin slice
// ported from unit/slice.js

var x = "abcdef";
__set_taint__(x);
var y = x.slice(2, 4);

__print_if_tainted__(y);
