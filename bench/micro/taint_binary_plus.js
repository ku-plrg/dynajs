// @type taint
// @target es5 binary-plus
// @feature syntax binary-plus
// ported from unit/binary.js, unit/number_taint.js, unit/plain_concat.js

// tainted string + clean literal -> tainted.
var sx = "asdf";
__set_taint__(sx);
__assert_taint__(sx + "1234", true);

// tainted number + clean literal -> tainted.
var nx = 5;
__set_taint__(nx);
__assert_taint__(nx + 1, true);

// neither operand tainted -> clean.
__assert_taint__("asdf" + "1234", false);
