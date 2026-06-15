// @type taint
// @target es5 assignment
// @feature syntax reassign-clears
// ported from unit/reassign_clears.js

var x = "asdf";
__set_taint__(x);
x = "asdf";

__assert_taint__(x, false);
