// @type taint
// @oracle true
// @target es5 binary-plus
// @feature syntax number-arith
// ported from unit/number_taint.js

var n = 5;
__set_taint__(n);
var m = n + 1;

__print_if_tainted__(m);
