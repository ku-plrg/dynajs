// @type taint
// @oracle false
// @target es5 String.prototype.slice
// @feature builtin slice
// ported from unit/slice.js

var x = "def";
__set_taint__(x);
x = "abc" + x + "gh";
var y = x.slice(6, 7);

__print_if_tainted__(y);
