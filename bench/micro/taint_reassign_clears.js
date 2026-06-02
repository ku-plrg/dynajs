// @type taint
// @oracle false
// @target es5 assignment
// @feature syntax reassign-clears
// ported from unit/reassign_clears.js

var x = "asdf";
__set_taint__(x);
x = "asdf";

__print_if_tainted__(x);
