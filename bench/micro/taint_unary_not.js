// @type taint
// @oracle true
// ported from unit/boolean_unary.js

var b = true;
__set_taint__(b);
var v = !b;

__print_if_tainted__(v);
