// @type taint
// @oracle false
// @target es6+ String.prototype.at
// @feature builtin at-out-of-bounds
// ported from unit/at_oob.js

var x = "asdf";
__set_taint__(x);
var y = x.at(99);

__print_if_tainted__(y);
