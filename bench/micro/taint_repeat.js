// @type taint
// @oracle true
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// ported from unit/repeat.js

var x = "ab";
__set_taint__(x);
var y = x.repeat(3);

__print_if_tainted__(y);
