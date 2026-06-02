// @type taint
// @oracle false
// @target es5 String.prototype.split
// @feature builtin split
// ported from unit/split_index.js

var x = "abcd";
__set_taint__(x);
x = "zz" + x;
var y = x.split("")[0]; // 'z' from the clean prefix

__print_if_tainted__(y);
