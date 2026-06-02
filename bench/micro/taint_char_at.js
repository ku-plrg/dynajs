// @type taint
// @oracle true
// @target es6+ String.prototype.at
// @feature builtin at
// ported from unit/at.js

var x = "asdf";
__set_taint__(x);
var y = x.at(0);

__print_if_tainted__(y);
