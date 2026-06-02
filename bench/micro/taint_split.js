// @type taint
// @oracle true
// @target es5 String.prototype.split
// @feature builtin split
// ported from unit/split_index.js

var x = "key=val";
__set_taint__(x);
var y = x.split("=")[1];

__print_if_tainted__(y);
