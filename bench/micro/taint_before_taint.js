// @type taint
// @oracle false
// @target es6+ String.prototype.at
// @feature builtin at-before-taint
// ported from unit/before_taint.js

var x = "asdf";
var y = x.at(0);
__set_taint__(x);

__print_if_tainted__(y);
