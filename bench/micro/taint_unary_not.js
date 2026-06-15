// @type taint
// @target es5 logical-not
// @feature syntax unary-not
// ported from unit/boolean_unary.js

var b = true;
__set_taint__(b);
var v = !b;

__assert_taint__(v, true);
