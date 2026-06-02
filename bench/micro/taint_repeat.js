// @type taint
// @oracle true
// ported from unit/repeat.js

var x = "ab";
__set_taint__(x);
var y = x.repeat(3);

__print_if_tainted__(y);
