// @type taint
// @oracle true
// ported from unit/slice.js

var x = "abcdef";
__set_taint__(x);
var y = x.slice(2, 4);

__print_if_tainted__(y);
