// @type taint
// @oracle true
// @target es5 logical-not
// @feature syntax unary-not
// ported from unit/boolean_unary.js

var b = true;
__set_taint__(b);
var v = !b;

__print_if_tainted__(v);
